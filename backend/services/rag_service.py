import io
import uuid
import structlog
from typing import List, Dict, Any, Optional

logger = structlog.get_logger(__name__)

# Lazy imports for optional heavy dependencies
_fitz = None
_docx = None
_SentenceTransformer = None
_get_collection = None
_RAG_AVAILABLE = False

def _ensure_rag_deps():
    global _fitz, _docx, _SentenceTransformer, _get_collection, _RAG_AVAILABLE
    if _RAG_AVAILABLE:
        return True
    try:
        import fitz
        import docx
        from sentence_transformers import SentenceTransformer
        from vector_db.chroma_client import get_collection
        _fitz = fitz
        _docx = docx
        _SentenceTransformer = SentenceTransformer
        _get_collection = get_collection
        _RAG_AVAILABLE = True
        logger.info("RAG dependencies loaded successfully")
        return True
    except Exception as e:
        logger.warning("RAG dependencies not available", error=str(e))
        return False


class RAGService:
    def __init__(self):
        self.encoder = None
        self.collection_name = "rag_documents"
        self.collection = None
        self._initialized = False

    def _initialize(self):
        """Lazy initialization of heavy RAG components."""
        if self._initialized:
            return self._initialized
        if not _ensure_rag_deps():
            logger.warning("RAG service unavailable - dependencies missing")
            self._initialized = False
            return False
        try:
            logger.info("Initializing SentenceTransformer model all-MiniLM-L6-v2")
            self.encoder = _SentenceTransformer("all-MiniLM-L6-v2")
            self.collection = _get_collection(self.collection_name)
            self._initialized = self.collection is not None
            if self._initialized:
                logger.info("RAG service initialized successfully")
            else:
                logger.warning("RAG collection is None, service may be degraded")
            return self._initialized
        except Exception as e:
            logger.error("RAG service initialization failed", error=str(e))
            self._initialized = False
            return False

    def _extract_text_pdf(self, file_bytes: bytes) -> str:
        """
        Extracts text from PDF bytes using PyMuPDF.
        """
        text = ""
        try:
            with _fitz.open(stream=file_bytes, filetype="pdf") as doc:
                for page in doc:
                    text += page.get_text() + "\n"
        except Exception as e:
            logger.error("Failed to extract text from PDF", error=str(e))
            raise ValueError(f"Could not parse PDF: {str(e)}")
        return text

    def _extract_text_docx(self, file_bytes: bytes) -> str:
        """
        Extracts text from DOCX bytes using python-docx.
        """
        text = ""
        try:
            doc = _docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            logger.error("Failed to extract text from DOCX", error=str(e))
            raise ValueError(f"Could not parse DOCX: {str(e)}")
        return text

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Splits text into chunks of roughly chunk_size words with overlap.
        """
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            # Form chunk of size chunk_size
            chunk_words = words[i:i + chunk_size]
            chunks.append(" ".join(chunk_words))
            # Move index forward by chunk_size - overlap
            i += (chunk_size - overlap)
            # Prevent infinite loops in edge cases
            if chunk_size <= overlap:
                break
        return chunks

    async def index_document(self, file_bytes: bytes, filename: str, user_id: str, doc_id: str) -> None:
        """
        Extracts, chunks, embeds, and indexes a PDF/DOCX file in ChromaDB.
        """
        if not self._initialize():
            raise RuntimeError("RAG service is not available. Please check ChromaDB and sentence-transformers installation.")

        # 1. Extract text
        ext = filename.split(".")[-1].lower()
        if ext == "pdf":
            text = self._extract_text_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            text = self._extract_text_docx(file_bytes)
        else:
            raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")
            
        if not text.strip():
            raise ValueError("No text could be extracted from the document.")

        # 2. Chunk text (500 tokens/words size, 50 overlap)
        chunks = self._chunk_text(text, chunk_size=500, overlap=50)
        logger.info("Document chunked", filename=filename, chunks_count=len(chunks))

        # 3. Generate embeddings
        embeddings = self.encoder.encode(chunks).tolist()

        # 4. Generate ids and metadatas
        ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "user_id": user_id,
                "doc_id": doc_id,
                "filename": filename,
                "chunk_index": i
            } for i in range(len(chunks))
        ]

        # 5. Store in ChromaDB
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        logger.info("Document indexed successfully in ChromaDB", doc_id=doc_id, user_id=user_id)

    async def query(self, question: str, user_id: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Embeds the question, queries ChromaDB, and returns matching context chunks.
        """
        if not self._initialize():
            return []

        # 1. Generate query embedding
        query_embedding = self.encoder.encode(question).tolist()

        # 2. Query ChromaDB with metadata filter on user_id
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"user_id": user_id}
        )

        # 3. Format results
        formatted_chunks = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)
            
            for doc, meta, dist in zip(docs, metas, distances):
                formatted_chunks.append({
                    "content": doc,
                    "metadata": meta,
                    "distance": dist
                })
        return formatted_chunks

    async def generate_answer(self, question: str, chunks: List[Dict[str, Any]], groq_client: Any) -> str:
        """
        Builds a context-injected prompt and uses the Groq LLM to generate an answer.
        """
        if not chunks:
            return "I couldn't find any relevant information in your uploaded documents to answer this question."

        # Format context
        context_str = ""
        for i, chunk in enumerate(chunks):
            filename = chunk["metadata"].get("filename", "Unknown Document")
            context_str += f"--- Source Document: {filename} (Chunk {i+1}) ---\n{chunk['content']}\n\n"

        prompt = f"""You are a helpful AI Startup Consultant. You are answering a business query based on the following uploaded documentation contexts.
If the answer cannot be found in the context, say so or try to answer based on general startup principles, but explicitly denote what is sourced from the documents vs. general advice.

Context information:
{context_str}

User's Question:
{question}

Provide a detailed, professional, structured response. Include citations of the source document names when referencing specific points.
"""
        # Call Groq LLM
        messages = [
            {"role": "system", "content": "You are a professional business advisor providing context-specific guidance."},
            {"role": "user", "content": prompt}
        ]
        
        # Invoke Groq chat completion model
        response = groq_client.invoke(messages)
        return response.content

# Singleton instance (lazy-initialized)
rag_service = RAGService()
