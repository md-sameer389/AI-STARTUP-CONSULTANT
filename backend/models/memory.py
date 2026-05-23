import uuid
from datetime import datetime
from sqlalchemy import Column, JSON, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base

class UserMemory(Base):
    __tablename__ = "user_memories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    past_ideas = Column(JSON, default=list, nullable=False) # List of past startup ideas (last N)
    report_ids = Column(JSON, default=list, nullable=False) # List of generated report IDs
    preferences = Column(JSON, default=dict, nullable=False) # Key-value preferences for RAG or context
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
