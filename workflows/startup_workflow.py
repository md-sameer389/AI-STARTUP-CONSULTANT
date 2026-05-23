import asyncio
import structlog
from backend.celery_app import celery_app
from backend.database import async_session_maker
from backend.services.job_service import (
    update_job_status,
    update_job_results,
    complete_job,
    fail_job
)
from backend.services.memory_service import MemoryService
from agents.research_agent import ResearchAgent
from agents.competitor_agent import CompetitorAgent
from agents.strategy_agent import StrategyAgent
from agents.finance_agent import FinanceAgent
from agents.swot_agent import SWOTAgent
from agents.pitch_agent import PitchAgent
from agents.report_agent import ReportAgent

logger = structlog.get_logger(__name__)

async def run_pipeline(job_id: str, startup_idea: str, user_id: str = None):
    """
    Asynchronous runner executing the 7-agent pipeline in order.
    """
    logger.info("Starting startup analysis pipeline", job_id=job_id, user_id=user_id)
    
    async with async_session_maker() as db:
        try:
            # 0. Retrieve memory context if user_id is provided
            memory_context = ""
            if user_id:
                memory_context = await MemoryService.get_context_summary(db, user_id)
                logger.info("Loaded user memory context", user_id=user_id, context_length=len(memory_context))

            # Base input payload
            pipeline_data = {
                "startup_idea": startup_idea,
                "job_id": job_id,
                "memory_context": memory_context
            }

            # ----------------------------------------------------
            # Agent 1: Market Research (0% -> 14%)
            # ----------------------------------------------------
            await update_job_status(db, job_id, status="running", current_agent="Market Research Agent", progress_percent=5)
            research_agent = ResearchAgent()
            # If memory context exists, we append it to the idea context
            input_research = pipeline_data.copy()
            if memory_context:
                input_research["startup_idea"] = f"{startup_idea} (Note: {memory_context})"
                
            market_results = research_agent.run(input_research)
            await update_job_results(db, job_id, "market_research", market_results)
            pipeline_data["market_research"] = market_results
            pipeline_data["market_summary"] = market_results.get("summary", "")

            # ----------------------------------------------------
            # Agent 2: Competitor Analysis (14% -> 28%)
            # ----------------------------------------------------
            await update_job_status(db, job_id, status="running", current_agent="Competitor Analysis Agent", progress_percent=20)
            competitor_agent = CompetitorAgent()
            competitor_results = competitor_agent.run(pipeline_data)
            await update_job_results(db, job_id, "competitor_analysis", competitor_results)
            pipeline_data["competitor_analysis"] = competitor_results
            pipeline_data["competitor_report"] = competitor_results

            # ----------------------------------------------------
            # Agent 3: Business Strategy (28% -> 42%)
            # ----------------------------------------------------
            await update_job_status(db, job_id, status="running", current_agent="Business Strategy Agent", progress_percent=35)
            strategy_agent = StrategyAgent()
            strategy_results = strategy_agent.run(pipeline_data)
            await update_job_results(db, job_id, "business_strategy", strategy_results)
            pipeline_data["business_strategy"] = strategy_results

            # ----------------------------------------------------
            # Agent 4: Financial Estimation (42% -> 57%)
            # ----------------------------------------------------
            await update_job_status(db, job_id, status="running", current_agent="Financial Estimation Agent", progress_percent=50)
            finance_agent = FinanceAgent()
            financials_results = finance_agent.run(pipeline_data)
            await update_job_results(db, job_id, "financials", financials_results)
            pipeline_data["financials"] = financials_results

            # ----------------------------------------------------
            # Agent 5: SWOT Analysis (57% -> 71%)
            # ----------------------------------------------------
            await update_job_status(db, job_id, status="running", current_agent="SWOT Analysis Agent", progress_percent=65)
            swot_agent = SWOTAgent()
            swot_results = swot_agent.run(pipeline_data)
            await update_job_results(db, job_id, "swot", swot_results)
            pipeline_data["swot"] = swot_results

            # ----------------------------------------------------
            # Agent 6: Pitch Deck (71% -> 85%)
            # ----------------------------------------------------
            await update_job_status(db, job_id, status="running", current_agent="Pitch Deck Agent", progress_percent=80)
            pitch_agent = PitchAgent()
            pitch_results = pitch_agent.run(pipeline_data)
            await update_job_results(db, job_id, "pitch_deck", pitch_results)
            pipeline_data["pitch_deck"] = pitch_results

            # ----------------------------------------------------
            # Agent 7: Report Generation & Compilation (85% -> 100%)
            # ----------------------------------------------------
            await update_job_status(db, job_id, status="running", current_agent="Report Generation Agent", progress_percent=90)
            report_agent = ReportAgent()
            report_results = report_agent.run(pipeline_data)
            
            pdf_url = report_results.get("pdf_url", "")
            
            # Save final results and complete job
            await complete_job(db, job_id, pdf_url)
            
            # 8. Record this report in user's MemoryStore if user_id exists
            if user_id:
                await MemoryService.add_report(db, user_id, startup_idea, job_id)
                logger.info("Recorded analysis in memory store", user_id=user_id, job_id=job_id)
                
            logger.info("Startup analysis workflow completed successfully", job_id=job_id)

        except Exception as e:
            logger.error("Analysis pipeline failed with exception", job_id=job_id, error=str(e))
            await fail_job(db, job_id, str(e))
            raise e


@celery_app.task(bind=True, name="workflows.startup_workflow.run_startup_analysis")
def run_startup_analysis(self, job_id: str, startup_idea: str, user_id: str = None):
    """
    Celery task orchestrator. Uses asyncio.run to execute the async database flow.
    """
    asyncio.run(run_pipeline(job_id, startup_idea, user_id))
