import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    startup_idea = Column(Text, nullable=False)
    status = Column(String, default="queued", nullable=False) # queued, running, completed, failed
    current_agent = Column(String, nullable=True)
    progress_percent = Column(Integer, default=0, nullable=False)
    
    # Store Agent Results
    market_research = Column(JSON, nullable=True)
    competitor_analysis = Column(JSON, nullable=True)
    business_strategy = Column(JSON, nullable=True)
    financials = Column(JSON, nullable=True)
    swot = Column(JSON, nullable=True)
    pitch_deck = Column(JSON, nullable=True)
    
    # Output file
    pdf_url = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
