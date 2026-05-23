from datetime import datetime
from typing import Dict, Any
import structlog
from agents.base_agent import BaseAgent
from tools.search_tool import TavilySearchTool

logger = structlog.get_logger(__name__)

class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Research Agent",
            role="Senior Market Research Analyst",
            goal="Search the web and return structured market data for the startup idea"
        )
        self.search_tool = TavilySearchTool()

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        startup_idea = input_data.get("startup_idea", "")
        if not startup_idea:
            raise ValueError("startup_idea is required for ResearchAgent")
            
        current_year = datetime.now().year
        logger.info("ResearchAgent running", startup_idea=startup_idea, year=current_year)

        # Execute searches across distinct vectors
        query_size = f"{startup_idea} market size statistics value {current_year}"
        query_trends = f"{startup_idea} market trends industry analysis {current_year}"
        query_demographics = f"{startup_idea} target audience demographics customer profile"
        query_demand = f"{startup_idea} consumer demand signals growth indicators"

        logger.info("Conducting Tavily searches...")
        size_results = self.search_tool.search_and_summarize(query_size, max_results=3)
        trends_results = self.search_tool.search_and_summarize(query_trends, max_results=3)
        demo_results = self.search_tool.search_and_summarize(query_demographics, max_results=3)
        demand_results = self.search_tool.search_and_summarize(query_demand, max_results=3)

        prompt = f"""You are analyzing a startup idea: "{startup_idea}" for the year {current_year}.
Based on the following factual web search summaries, compile a structured market research report in JSON format.

--- SEARCH DATA: MARKET SIZE ---
{size_results}

--- SEARCH DATA: INDUSTRY TRENDS ---
{trends_results}

--- SEARCH DATA: TARGET DEMOGRAPHICS ---
{demo_results}

--- SEARCH DATA: CONSUMER DEMAND SIGNALS ---
{demand_results}

--- INSTRUCTIONS ---
You must output a single JSON object. Do not add any conversational text before or after the JSON.
Your JSON must strictly follow this structure:
{{
  "market_size": "Provide a detailed estimation of market size. Include approximate dollar figures, volumes, or growth percentages with citations from search data (e.g., 'Global market valued at ~$15B in 2024 with 8% CAGR').",
  "target_demographics": [
    "Demographic cohort 1 (e.g. Age, Income, Profession, Location)",
    "Demographic cohort 2"
  ],
  "industry_trends": [
    "Key trend 1 (specific to technology, consumer preference, or regulatory shifts)",
    "Key trend 2"
  ],
  "demand_signals": [
    "Verifiable demand signal 1 (e.g. search volume growth, survey data, increase in related startup funding)",
    "Verifiable demand signal 2"
  ],
  "summary": "A cohesive executive summary synthesizing what the data implies about market feasibility."
}}

Ensure all numbers are realistic and directly derived or approximated from the search results. Do not make up facts.
"""
        raw_response = self._call_llm(prompt)
        parsed = self._parse_json_response(raw_response)
        return parsed
