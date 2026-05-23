import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.memory import UserMemory

class MemoryService:
    @staticmethod
    async def get_or_create_memory(db: AsyncSession, user_id: str) -> UserMemory:
        """
        Fetches or initializes the memory store for a user.
        """
        uid = uuid.UUID(user_id)
        result = await db.execute(select(UserMemory).where(UserMemory.user_id == uid))
        memory = result.scalars().first()
        
        if not memory:
            memory = UserMemory(user_id=uid, past_ideas=[], report_ids=[], preferences={})
            db.add(memory)
            await db.commit()
            await db.refresh(memory)
            
        return memory

    @classmethod
    async def add_report(cls, db: AsyncSession, user_id: str, idea: str, report_id: str) -> UserMemory:
        """
        Appends a newly analyzed idea and report to the user's memory.
        Maintains a sliding window of past items.
        """
        memory = await cls.get_or_create_memory(db, user_id)
        
        # Prevent mutation errors by creating copies of list
        past_ideas = list(memory.past_ideas or [])
        report_ids = list(memory.report_ids or [])
        
        # Append new details
        if idea not in past_ideas:
            past_ideas.append(idea)
        if report_id not in report_ids:
            report_ids.append(report_id)
            
        # Keep last 5 entries
        memory.past_ideas = past_ideas[-5:]
        memory.report_ids = report_ids[-5:]
        
        db.add(memory)
        await db.commit()
        await db.refresh(memory)
        return memory

    @classmethod
    async def get_context_summary(cls, db: AsyncSession, user_id: Optional[str]) -> str:
        """
        Returns a formatted string representing the user's past 3 startup ideas.
        This will be injected into downstream agent prompts for background context.
        """
        if not user_id:
            return ""
            
        try:
            memory = await cls.get_or_create_memory(db, user_id)
            ideas = memory.past_ideas or []
            if not ideas:
                return ""
            
            # Format last 3 ideas
            recent_ideas = ideas[-3:]
            ideas_str = ", ".join([f'"{idea}"' for idea in recent_ideas])
            return f"User's past analyzed startup ideas for reference context: {ideas_str}."
        except Exception:
            # Silent fallback if something fails during DB fetch or UUID parsing
            return ""
