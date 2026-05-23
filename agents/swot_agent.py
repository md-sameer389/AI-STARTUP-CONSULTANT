import json
from typing import Dict, Any
import structlog
from agents.base_agent import BaseAgent

logger = structlog.get_logger(__name__)

class SWOTAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="SWOT Analysis Agent",
            role="Strategic Business Advisor",
            goal="Generate a full SWOT analysis using all prior agent outputs as context"
        )

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        startup_idea = input_data.get("startup_idea", "")
        market_research = input_data.get("market_research", {})
        competitor_analysis = input_data.get("competitor_analysis", {})
        business_strategy = input_data.get("business_strategy", {})
        financials = input_data.get("financials", {})
        
        if not startup_idea:
            raise ValueError("startup_idea is required for SWOTAgent")
            
        logger.info("SWOTAgent running", startup_idea=startup_idea)

        # Context build
        context = {
            "startup_idea": startup_idea,
            "market_research": market_research,
            "competitor_analysis": competitor_analysis,
            "business_strategy": business_strategy,
            "financials": financials
        }
        context_str = json.dumps(context, indent=2)

        prompt = f"""You are a senior strategic business advisor.
Generate a SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) for: "{startup_idea}"

Review the complete context of our planning pipeline:
{context_str}

--- CRITICAL PROMPT GUIDELINES ---
1. Each quadrant (strengths, weaknesses, opportunities, threats) must have EXACTLY 4 to 6 bullet points. No more, no less.
2. Every single point must be highly specific to the startup's idea, technology stack, target audience, competitors, and financial dynamics. 
3. DO NOT use generic platitudes (e.g. 'Strong competition' or 'Technological complexity'). Instead use precise, context-rich assessments.

--- INSTRUCTIONS ---
You must output a single JSON object. Do not include any text before or after the JSON.
Your JSON must strictly follow this structure:
{{
  "strengths": [
    "Specific internal capability or advantage 1",
    "Specific internal capability or advantage 2",
    "Specific internal capability or advantage 3",
    "Specific internal capability or advantage 4"
  ],
  "weaknesses": [
    "Specific internal challenge or dependency 1",
    "Specific internal challenge or dependency 2",
    "Specific internal challenge or dependency 3",
    "Specific internal challenge or dependency 4"
  ],
  "opportunities": [
    "Specific external trend or market gap 1",
    "Specific external trend or market gap 2",
    "Specific external trend or market gap 3",
    "Specific external trend or market gap 4"
  ],
  "threats": [
    "Specific external risk or competitive movement 1",
    "Specific external risk or competitive movement 2",
    "Specific external risk or competitive movement 3",
    "Specific external risk or competitive movement 4"
  ]
}}
"""
        raw_response = self._call_llm(prompt)
        parsed = self._parse_json_response(raw_response)
        return parsed
