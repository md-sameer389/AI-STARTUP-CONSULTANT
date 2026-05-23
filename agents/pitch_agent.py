import json
from typing import Dict, Any
import structlog
from agents.base_agent import BaseAgent

logger = structlog.get_logger(__name__)

class PitchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Pitch Deck Agent",
            role="Startup Pitch Strategist",
            goal="Generate compelling, structured content for a 10-slide investor pitch deck"
        )

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        startup_idea = input_data.get("startup_idea", "")
        market_research = input_data.get("market_research", {})
        competitor_analysis = input_data.get("competitor_analysis", {})
        business_strategy = input_data.get("business_strategy", {})
        financials = input_data.get("financials", {})
        swot = input_data.get("swot", {})
        
        if not startup_idea:
            raise ValueError("startup_idea is required for PitchAgent")
            
        logger.info("PitchAgent running", startup_idea=startup_idea)

        # Build context
        context = {
            "startup_idea": startup_idea,
            "market_research": market_research,
            "competitor_analysis": competitor_analysis,
            "business_strategy": business_strategy,
            "financials": financials,
            "swot": swot
        }
        context_str = json.dumps(context, indent=2)

        prompt = f"""You are a pitch deck strategist who helps startups raise capital.
We need to generate a structured 10-slide pitch deck for: "{startup_idea}"

Review the complete context of our planning pipeline:
{context_str}

--- CRITICAL PROMPT GUIDELINES ---
Generate exactly 10 slides, in this precise order:
1. Problem Statement — What pain does the market experience?
2. Solution — How does this startup solve that pain?
3. Market Opportunity — TAM, SAM, SOM or market size estimates.
4. Product Overview — Core value proposition and feature set.
5. Business Model — Revenue streams and pricing.
6. Competitive Landscape — Competitors and our unique differentiator.
7. Go-to-Market Strategy — Core channels and acquisition.
8. Financial Projections — Revenue forecasts and key costs.
9. Team — Core roles required (use placeholders like "CEO - TBD", "CTO - TBD").
10. Ask / Call to Action — Capital amount required (match VC-funded financial plan bounds) and milestones it will achieve.

--- INSTRUCTIONS ---
You must output a single JSON object. Do not include any text before or after the JSON.
Your JSON must strictly follow this structure:
{{
  "slides": [
    {{
      "slide_number": 1,
      "title": "Title of the slide",
      "headline": "A single strong punchy statement summarizing the slide's core message",
      "bullet_points": [
        "Key supportive data or argument point 1",
        "Key supportive data or argument point 2",
        "Key supportive data or argument point 3"
      ],
      "speaker_notes": "What the presenter should say word-for-word or key themes to voice."
    }}
  ]
}}
"""
        raw_response = self._call_llm(prompt)
        parsed = self._parse_json_response(raw_response)
        return parsed
