import os
import cloudinary
import cloudinary.uploader
import structlog
from backend.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

class StorageService:
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

    def upload_pdf(self, file_path: str, public_id: str) -> str:
        """
        Uploads a PDF file from the local file path to Cloudinary.
        Returns the secure HTTPS URL.
        """
        try:
            logger.info("Uploading PDF to Cloudinary", file_path=file_path, public_id=public_id)
            response = cloudinary.uploader.upload(
                file_path,
                public_id=public_id,
                resource_type="auto", # auto-detect format so Cloudinary classifies PDF correctly as document/image
                folder="startup_reports",
                overwrite=True
            )
            secure_url = response.get("secure_url")
            logger.info("PDF uploaded successfully", url=secure_url)
            return secure_url
        except Exception as e:
            logger.error("Cloudinary PDF upload failed", error=str(e))
            raise e

    def upload_bytes(self, data: bytes, filename: str) -> str:
        """
        Uploads raw file bytes to Cloudinary.
        """
        try:
            logger.info("Uploading bytes to Cloudinary", filename=filename)
            response = cloudinary.uploader.upload(
                data,
                public_id=filename,
                resource_type="raw",
                folder="startup_uploads",
                overwrite=True
            )
            secure_url = response.get("secure_url")
            return secure_url
        except Exception as e:
            logger.error("Cloudinary bytes upload failed", error=str(e))
            raise e

storage_service = StorageService()
