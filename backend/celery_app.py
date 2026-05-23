import os
from celery import Celery

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("tasks", broker=redis_url, backend=redis_url)

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
