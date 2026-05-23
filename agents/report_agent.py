import os
from typing import Dict, Any
import structlog
from agents.base_agent import BaseAgent
from tools.pdf_generator import PDFGenerator
from backend.services.storage_service import storage_service
from backend.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

class ReportAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Report Generator Agent",
            role="Report Compiler",
            goal="Combine all agent outputs into one structured PDF business report and upload it"
        )

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        job_id = input_data.get("job_id")
        startup_idea = input_data.get("startup_idea", "")
        
        if not job_id:
            raise ValueError("job_id is required for ReportAgent")
            
        logger.info("ReportAgent compiling final document", job_id=job_id)

        # Build full payload
        report_data = {
            "startup_idea": startup_idea,
            "market_research": input_data.get("market_research"),
            "competitor_analysis": input_data.get("competitor_analysis"),
            "business_strategy": input_data.get("business_strategy"),
            "financials": input_data.get("financials"),
            "swot": input_data.get("swot"),
            "pitch_deck": input_data.get("pitch_deck")
        }

        # Ensure temp reports dir exists
        reports_dir = settings.REPORTS_DIR
        os.makedirs(reports_dir, exist_ok=True)
        
        temp_pdf_path = os.path.join(reports_dir, f"report_{job_id}.pdf")
        
        # 1. Generate local PDF file
        logger.info("Running PDF Generation Tool", path=temp_pdf_path)
        PDFGenerator.generate_report(report_data, temp_pdf_path)
        
        # 2. Upload to Cloudinary
        public_id = f"report_{job_id}"
        pdf_url = ""
        try:
            pdf_url = storage_service.upload_pdf(temp_pdf_path, public_id)
            logger.info("Report successfully uploaded", url=pdf_url)
            
            # Keep local copy as a fallback/cache for local downloads
            logger.info("Retained local copy of PDF report as fallback cache")
        except Exception as e:
            logger.error("Failed to upload PDF, keeping local backup", error=str(e))
            # Fallback URL if upload fails (e.g. invalid cloud credentials during testing)
            # In a real environment, we'd raise or fallback to a local serve URL
            pdf_url = f"/api/v1/report/{job_id}/download"

        return {
            "pdf_url": pdf_url,
            "report_json": report_data
        }
