from typing import Optional, List
from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    user_id: str
    job_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

class UploadResponse(BaseModel):
    doc_id: str
    status: str
