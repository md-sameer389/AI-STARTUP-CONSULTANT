from typing import Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    startup_idea: str = Field(..., min_length=10, max_length=500, description="Startup idea to analyze")
    user_id: Optional[str] = Field(None, description="Optional user ID associated with this analysis")

class AnalyzeResponse(BaseModel):
    job_id: str
    status: str
    message: str

class StatusResponse(BaseModel):
    job_id: str
    status: str
    current_agent: Optional[str] = None
    progress_percent: int
