import uuid
import structlog
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from langchain_groq import ChatGroq
from backend.config import get_settings
from backend.schemas.chat import ChatRequest, ChatResponse, UploadResponse
from backend.services.rag_service import rag_service

logger = structlog.get_logger(__name__)
settings = get_settings()

router = APIRouter(tags=["Document Q&A (RAG)"])

# Initialize Groq client specifically for Q&A sessions
groq_qa_llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY,
    model=settings.GROQ_MODEL,
    temperature=0.3, # lower temp for more factual/context-based answers
    timeout=30.0
)

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Accepts PDF or DOCX file upload, extracts text, chunks, embeds,
    and indexes into ChromaDB keyed by user_id.
    """
    filename = file.filename
    ext = filename.split(".")[-1].lower()
    
    if ext not in ["pdf", "docx", "doc"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PDF and DOCX uploads are allowed."
        )
        
    doc_id = str(uuid.uuid4())
    logger.info("Indexing uploaded document", filename=filename, user_id=user_id, doc_id=doc_id)
    
    try:
        file_bytes = await file.read()
        await rag_service.index_document(file_bytes, filename, user_id, doc_id)
    except Exception as e:
        logger.error("Failed to index document", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error indexing document: {str(e)}"
        )
        
    return UploadResponse(doc_id=doc_id, status="indexed")


@router.post("/chat", response_model=ChatResponse)
async def chat_qa(req: ChatRequest):
    """
    Queries indexed documents using vector similarity search,
    feeds context chunks to Groq LLM, and returns the response.
    """
    logger.info("RAG chat query received", question=req.question, user_id=req.user_id)
    
    try:
        # 1. Retrieve top 3 relevant chunks
        chunks = await rag_service.query(req.question, req.user_id, top_k=3)
        
        # 2. Extract unique source names
        sources = list(set([
            chunk["metadata"].get("filename", "Unknown Document")
            for chunk in chunks if "metadata" in chunk
        ]))
        
        # 3. Generate context-aware response using Groq
        answer = await rag_service.generate_answer(req.question, chunks, groq_qa_llm)
        
        logger.info("RAG chat response compiled", sources_count=len(sources))
        return ChatResponse(answer=answer, sources=sources)
        
    except Exception as e:
        logger.error("RAG chat pipeline failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate QA response: {str(e)}"
        )
