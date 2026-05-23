import json
from typing import Dict, Any
import structlog
from agents.base_agent import BaseAgent

logger = structlog.get_logger(__name__)

class FinanceAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Financial Estimation Agent",
            role="Startup Financial Analyst",
            goal="Estimate startup costs, monthly expenses, revenue projections, and funding models"
        )

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        startup_idea = input_data.get("startup_idea", "")
        business_model = input_data.get("business_model", {})
        market_summary = input_data.get("market_summary", "")
        
        if not startup_idea:
            raise ValueError("startup_idea is required for FinanceAgent")
            
        logger.info("FinanceAgent running", startup_idea=startup_idea)

        business_model_str = json.dumps(business_model, indent=2)

        prompt = f"""You are a startup financial analyst.
Provide a realistic financial projection for the startup idea: "{startup_idea}"
Business Model details: {business_model_str}
Market context: {market_summary}

Determine startup costs, monthly operational costs, revenue run-rate projections (months 6, 12, 24), time to break-even, and funding recommendations.

--- CRITICAL PROMPT GUIDELINES ---
1. All figures must be expressed as ranges, NOT flat values (e.g., "$15,000–$30,000" instead of "$20,000").
2. Your estimates and recommendations must explicitly compare a Bootstrapped Scenario and a VC-Funded Scenario.
3. Return the projections in USD.

--- INSTRUCTIONS ---
You must output a single JSON object. Do not include any text before or after the JSON.
Your JSON must strictly follow this structure:
{{
  "startup_costs": {{
    "development": "Range of development costs (e.g. '$10,000–$25,000 bootstrapped / $80,000–$150,000 VC-funded')",
    "infrastructure": "Range of hosting, domain, data API and backend costs (e.g. '$1,000–$3,000 bootstrapped / $10,000–$25,000 VC-funded')",
    "marketing": "Launch marketing costs (e.g. '$2,000–$5,000 bootstrapped / $30,000–$60,000 VC-funded')",
    "legal": "Incorporation, compliance and contract costs (e.g. '$500–$1,500 bootstrapped / $5,000–$10,000 VC-funded')",
    "total_estimated": "Sum total estimated range (e.g. '$13,500–$34,500 bootstrapped / $125,000–$245,000 VC-funded')"
  }},
  "monthly_operational_costs": "Monthly operational run-rate costs range (e.g., '$500–$1,500/mo bootstrapped / $15,000–$25,000/mo VC-funded')",
  "revenue_projection": {{
    "month_6": "Estimated monthly recurring revenue run-rate (e.g., '$2,000–$5,000/mo bootstrapped / $10,000–$20,000/mo VC-funded')",
    "month_12": "Estimated monthly recurring revenue run-rate (e.g., '$8,000–$15,000/mo bootstrapped / $40,000–$75,000/mo VC-funded')",
    "month_24": "Estimated monthly recurring revenue run-rate (e.g., '$25,000–$50,000/mo bootstrapped / $150,000–$250,000/mo VC-funded')"
  }},
  "break_even_estimate": "Estimated time to reach profitability (e.g., '8–12 months bootstrapped / 18–24 months VC-funded')",
  "funding_recommendation": "Detailed evaluation recommending which path makes the most sense based on market conditions, including specific milestones required."
}}
"""
        raw_response = self._call_llm(prompt)
        parsed = self._parse_json_response(raw_response)
        return parsed
