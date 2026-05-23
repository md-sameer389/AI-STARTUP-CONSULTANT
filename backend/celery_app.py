from celery import Celery
from backend.config import get_settings

settings = get_settings()

celery_app = Celery(
    "startup_consultant",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configuration overrides
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Use solo pool to avoid billiard/prefork issues on Windows Python via WSL2
    worker_pool="solo",
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    # Auto-discover or register standard tasks
    imports=[
        "workflows.startup_workflow"
    ]
)
