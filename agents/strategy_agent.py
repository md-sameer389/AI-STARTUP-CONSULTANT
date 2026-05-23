import json
from typing import Dict, Any
import structlog
from agents.base_agent import BaseAgent

logger = structlog.get_logger(__name__)

class StrategyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Business Strategy Agent",
            role="Business Strategy Consultant",
            goal="Define the business model, target audience, monetization, and go-to-market plan"
        )

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        startup_idea = input_data.get("startup_idea", "")
        market_summary = input_data.get("market_summary", "")
        competitor_report = input_data.get("competitor_report", {})
        
        if not startup_idea:
            raise ValueError("startup_idea is required for StrategyAgent")
            
        logger.info("StrategyAgent running", startup_idea=startup_idea)

        competitor_report_str = json.dumps(competitor_report, indent=2)

        prompt = f"""You are a startup business strategy consultant. 
We need to design a comprehensive strategy for the following startup concept: "{startup_idea}"

We have gathered the following market research and competitive intelligence:
--- MARKET SUMMARY ---
{market_summary}

--- COMPETITIVE LANDSCAPE ---
{competitor_report_str}

Define the monetization model, core target audience segments, exact pricing tiers, and go-to-market plan.
Ensure the business strategy leverages the "market_gap" identified in the competitive report.

--- INSTRUCTIONS ---
You must output a single JSON object. Do not include any text before or after the JSON.
Your JSON must strictly follow this structure:
{{
  "business_model": "Describe the core business model (e.g. SaaS, Marketplace, Transactional, B2B Enterprise) and how the startup delivers value.",
  "target_audience": {{
    "primary": "Clear description of the primary user/customer persona.",
    "secondary": "Secondary customer personas or expansion segments."
  }},
  "revenue_streams": [
    "Monetization source 1 (e.g., Monthly recurring subscriptions)",
    "Monetization source 2 (e.g., Transaction fees, premium add-ons)"
  ],
  "pricing_tiers": [
    {{
      "tier": "Tier name (e.g., Free, Basic, Pro, Enterprise)",
      "price": "Price point (e.g., $19/month, Custom quote)",
      "features": [
        "Feature 1",
        "Feature 2"
      ]
    }}
  ],
  "go_to_market_strategy": [
    "Pre-launch/Phase 1 GTM tactic",
    "Launch/Phase 2 GTM tactic",
    "Post-launch/Phase 3 growth and scale tactic"
  ],
  "marketing_channels": [
    "Acquisition Channel 1 (e.g., Content Marketing / SEO)",
    "Acquisition Channel 2 (e.g., B2B Direct Sales / LinkedIn Outreach)"
  ]
}}
"""
        raw_response = self._call_llm(prompt)
        parsed = self._parse_json_response(raw_response)
        return parsed
