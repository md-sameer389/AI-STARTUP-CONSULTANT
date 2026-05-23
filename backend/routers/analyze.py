import structlog
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
from backend.middleware.rate_limit import rate_limiter
from backend.schemas.analyze import AnalyzeRequest, AnalyzeResponse, StatusResponse
from backend.services.job_service import create_job, get_job
from workflows.startup_workflow import run_startup_analysis

logger = structlog.get_logger(__name__)

router = APIRouter(tags=["Analysis"])

@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze(
    req: AnalyzeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a startup idea to start the 7-agent pipeline.
    This queues a Celery job and returns immediately.
    """
    # 1. Apply rate limit
    await rate_limiter.check_rate_limit(request, user_id=req.user_id)
    
    logger.info("Received analyze request", idea=req.startup_idea, user_id=req.user_id)
    
    # 2. Save job to database
    db_job = await create_job(db, req.startup_idea, req.user_id)
    job_id_str = str(db_job.id)
    
    # 3. Queue Celery task
    try:
        run_startup_analysis.delay(job_id_str, req.startup_idea, req.user_id)
        logger.info("Queued analysis job", job_id=job_id_str)
    except Exception as e:
        logger.error("Failed to queue Celery job", job_id=job_id_str, error=str(e))
        # Update job as failed in DB
        db_job.status = "failed"
        db_job.error_message = f"Celery queue error: {str(e)}"
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue the analysis job with the worker."
        )
        
    return AnalyzeResponse(
        job_id=job_id_str,
        status="queued",
        message="Analysis started"
    )


@router.get("/status/{job_id}", response_model=StatusResponse)
async def get_analysis_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves the status of a specific analysis job. Used for frontend polling.
    """
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
        
    return StatusResponse(
        job_id=str(job.id),
        status=job.status,
        current_agent=job.current_agent,
        progress_percent=job.progress_percent
    )
