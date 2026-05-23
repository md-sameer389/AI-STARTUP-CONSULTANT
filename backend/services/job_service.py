import uuid
from typing import List, Optional, Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.job import Job

async def create_job(db: AsyncSession, startup_idea: str, user_id: Optional[str] = None) -> Job:
    """
    Creates a new Job in the database.
    """
    if user_id:
        try:
            uid = uuid.UUID(user_id)
        except ValueError:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user_id format. Must be a valid UUID."
            )
    else:
        uid = None
    db_job = Job(
        startup_idea=startup_idea,
        user_id=uid,
        status="queued",
        progress_percent=0
    )
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    return db_job

async def get_job(db: AsyncSession, job_id: str) -> Optional[Job]:
    """
    Retrieves a Job by ID.
    """
    try:
        jid = uuid.UUID(job_id)
    except ValueError:
        return None
        
    result = await db.execute(select(Job).where(Job.id == jid))
    return result.scalars().first()

async def update_job_status(
    db: AsyncSession, 
    job_id: str, 
    status: str, 
    current_agent: Optional[str] = None, 
    progress_percent: Optional[int] = None
) -> Optional[Job]:
    """
    Updates the execution status of a Job.
    """
    job = await get_job(db, job_id)
    if not job:
        return None
        
    job.status = status
    if current_agent is not None:
        job.current_agent = current_agent
    if progress_percent is not None:
        job.progress_percent = progress_percent
        
    await db.commit()
    await db.refresh(job)
    return job

async def update_job_results(db: AsyncSession, job_id: str, field_name: str, data: Any) -> Optional[Job]:
    """
    Dynamically updates a specific JSON result field on the Job.
    """
    job = await get_job(db, job_id)
    if not job:
        return None
        
    if hasattr(job, field_name):
        setattr(job, field_name, data)
        
    await db.commit()
    await db.refresh(job)
    return job

async def complete_job(db: AsyncSession, job_id: str, pdf_url: str) -> Optional[Job]:
    """
    Completes a Job, setting its progress to 100% and providing the final report URL.
    """
    job = await get_job(db, job_id)
    if not job:
        return None
        
    job.status = "completed"
    job.progress_percent = 100
    job.current_agent = None
    job.pdf_url = pdf_url
    
    await db.commit()
    await db.refresh(job)
    return job

async def fail_job(db: AsyncSession, job_id: str, error_message: str) -> Optional[Job]:
    """
    Marks a Job as failed and logs the error.
    """
    job = await get_job(db, job_id)
    if not job:
        return None
        
    job.status = "failed"
    job.error_message = error_message
    
    await db.commit()
    await db.refresh(job)
    return job

async def get_user_jobs(db: AsyncSession, user_id: str) -> List[Job]:
    """
    Retrieves all Jobs completed or run by a specific user.
    """
    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        return []
        
    result = await db.execute(
        select(Job).where(Job.user_id == uid).order_by(Job.created_at.desc())
    )
    return list(result.scalars().all())
