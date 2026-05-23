import json
import re
from typing import Dict, Any, List
import structlog
from abc import ABC, abstractmethod
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from backend.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, goal: str):
        self.name = name
        self.role = role
        self.goal = goal
        
        # Initialize Groq LLM client via LangChain wrapper
        if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
            logger.warning("GROQ_API_KEY is not set correctly in config.")
            
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
            temperature=0.7,
            timeout=30.0,
            max_retries=1 # Tenacity wrapper manages retries externally
        )

    @abstractmethod
    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main run method containing the execution flow of the agent.
        """
        pass

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    def _call_llm(self, prompt: str) -> str:
        """
        Queries the Groq model. Wraps execution in standard tenacity retries.
        """
        logger.info("Calling LLM", agent=self.name)
        system_prompt = self._build_system_prompt()
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=prompt)
        ]
        
        try:
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            logger.error("LLM call failed", agent=self.name, error=str(e))
            raise e

    def _build_system_prompt(self) -> str:
        """
        Forms system context based on Agent definition parameters.
        """
        return (
            f"You are a professional business advisor operating under the role: '{self.role}'.\n"
            f"Your specific objective/goal is: '{self.goal}'.\n"
            f"You must deliver highly structured outputs conforming EXACTLY to the requested JSON layout.\n"
            f"Provide professional, insightful, and data-backed evaluations. Do not use placeholders or lazy stubs."
        )

    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """
        Attempts to extract and parse raw JSON text or JSON code block enclosures.
        """
        # Clean response string
        text = response.strip()
        
        # Look for ```json ... ``` code blocks
        json_match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
        if json_match:
            text = json_match.group(1).strip()
        else:
            # Fallback block match without content label
            code_block_match = re.search(r"```\s*(.*?)\s*```", text, re.DOTALL)
            if code_block_match:
                text = code_block_match.group(1).strip()
                
        # Basic trimming of any leading/trailing garbage chars
        if not text.startswith("{") and "{" in text:
            text = text[text.find("{"):]
        if not text.endswith("}") and "}" in text:
            text = text[:text.rfind("}")+1]
            
        try:
            parsed = json.loads(text)
            return parsed
        except json.JSONDecodeError as e:
            logger.error("Failed to parse JSON response", agent=self.name, raw_response=response, error=str(e))
            # Attempt to return a dictionary with raw data if parse fails to avoid blowing up pipeline
            return {
                "error": "Failed to parse structured JSON from LLM",
                "raw_content": response
            }
