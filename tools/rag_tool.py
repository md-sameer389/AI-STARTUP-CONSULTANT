from typing import Optional
import structlog
from backend.services.rag_service import rag_service

logger = structlog.get_logger(__name__)

class RAGTool:
    @staticmethod
    async def retrieve_context(question: str, user_id: Optional[str]) -> str:
        """
        Retrieves context chunks relevant to a question for a specific user and returns a consolidated string.
        """
        if not user_id:
            return ""
            
        try:
            logger.info("RAGTool retrieving context", question=question, user_id=user_id)
            chunks = await rag_service.query(question, user_id, top_k=3)
            if not chunks:
                return ""
                
            context_pieces = []
            for i, chunk in enumerate(chunks):
                filename = chunk["metadata"].get("filename", "document")
                context_pieces.append(f"[Document Source: {filename}]\n{chunk['content']}")
                
            return "\n\n".join(context_pieces)
        except Exception as e:
            logger.error("RAGTool failed to retrieve context", error=str(e))
            return ""
