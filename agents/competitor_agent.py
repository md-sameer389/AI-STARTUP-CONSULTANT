from typing import Dict, Any
import structlog
from agents.base_agent import BaseAgent
from tools.search_tool import TavilySearchTool

logger = structlog.get_logger(__name__)

class CompetitorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Competitor Analysis Agent",
            role="Competitive Intelligence Analyst",
            goal="Find 4-6 real competitors. Analyze their features, pricing, strengths, weaknesses"
        )
        self.search_tool = TavilySearchTool()

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        startup_idea = input_data.get("startup_idea", "")
        market_summary = input_data.get("market_summary", "")
        
        if not startup_idea:
            raise ValueError("startup_idea is required for CompetitorAgent")
            
        logger.info("CompetitorAgent running", startup_idea=startup_idea)

        # Execute searches for competitors
        query_competitors = f"{startup_idea} competitors companies alternatives"
        query_pricing = f"{startup_idea} competitor pricing plans subscription cost"

        logger.info("Searching for competitors...")
        competitor_search = self.search_tool.search_and_summarize(query_competitors, max_results=4)
        pricing_search = self.search_tool.search_and_summarize(query_pricing, max_results=4)

        prompt = f"""You are analyzing competitive landscape for a new startup idea: "{startup_idea}".
Market context summary: {market_summary}

Based on the following search summaries of real competitors, identify 4 to 6 actual, verifiable competitors.
Compile a detailed competitor intelligence report in JSON format.

--- SEARCH DATA: COMPETITORS & ALTERNATIVES ---
{competitor_search}

--- SEARCH DATA: COMPETITOR PRICING & CHANNELS ---
{pricing_search}

--- INSTRUCTIONS ---
You must output a single JSON object. Do not include any text before or after the JSON.
Your JSON must strictly follow this structure:
{{
  "competitors": [
    {{
      "name": "Exact name of a real company",
      "website": "Domain URL of the company (e.g. www.competitor.com)",
      "pricing": "Summary of pricing tiers (e.g., '$10/mo basic, $30/mo pro' or 'Freemium')",
      "strengths": [
        "Core strength 1",
        "Core strength 2"
      ],
      "weaknesses": [
        "Core weakness 1",
        "Core weakness 2"
      ],
      "differentiator": "How they position themselves in the market"
    }}
  ],
  "market_gap": "Explain the unmet customer need or structural gap in these competitors' offerings. What specific segment or capability are they leaving underserved?"
}}

CRITICAL REQUIREMENT: Do not make up competitor companies. They must be real companies whose URLs or names can be verified in the search results. If you cannot find 4, provide at least 3, but aim for 4 to 6.
"""
        raw_response = self._call_llm(prompt)
        parsed = self._parse_json_response(raw_response)
        return parsed
