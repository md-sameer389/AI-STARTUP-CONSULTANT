from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel

class ReportResponse(BaseModel):
    job_id: str
    startup_idea: str
    created_at: datetime
    market_research: Optional[Dict[str, Any]] = None
    competitor_analysis: Optional[Dict[str, Any]] = None
    business_strategy: Optional[Dict[str, Any]] = None
    financials: Optional[Dict[str, Any]] = None
    swot: Optional[Dict[str, Any]] = None
    pitch_deck: Optional[Dict[str, Any]] = None
    pdf_url: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: str
    status_code: int
