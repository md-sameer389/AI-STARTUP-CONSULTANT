import os
import structlog
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.config import get_settings
from backend.database import init_db
from backend.routers import auth, analyze, reports, chat
from backend.schemas.report import ErrorResponse

# Configure structlog for structured logging
structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger(__name__)

settings = get_settings()

app = FastAPI(
    title="Autonomous AI Startup Consultant API",
    version="1.0.0",
    description="Multi-agent strategic planning pipeline for new business ideas"
)

# CORS Configuration
# Standard CORS config allowing frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-project-name.vercel.app",
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB migration hook
@app.on_event("startup")
async def on_startup():
    logger.info("Starting up backend API server")
    # Ensure temporary PDF report directory exists
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    # Ensure vector store directory exists
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    
    try:
        await init_db()
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize database tables", error=str(e))

# Include API Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(analyze.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")

# Global Health Check
@app.get("/api/v1/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check_v1():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "api_version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": os.getenv("ENVIRONMENT", "development")}

# Standardized Global Error Response Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled request exception occurred", path=request.url.path, error=str(exc))
    
    error_msg = "Internal Server Error"
    detail_msg = str(exc)
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    
    # Handle custom HTTPExceptions to preserve their status code and detail
    if hasattr(exc, "status_code") and hasattr(exc, "detail"):
        status_code = exc.status_code
        detail_msg = exc.detail
        error_msg = "HTTP Exception"
        
    return JSONResponse(
        status_code=status_code,
        content={
            "error": error_msg,
            "detail": detail_msg,
            "status_code": status_code
        }
    )
