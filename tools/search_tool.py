from typing import List, Dict, Any
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from tavily import TavilyClient
from backend.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

class TavilySearchTool:
    def __init__(self):
        self.api_key = settings.TAVILY_API_KEY
        if not self.api_key or self.api_key == "your_tavily_api_key_here":
            logger.warning("Tavily API key is missing or placeholder. Search functions may fail.")
        self.client = TavilyClient(api_key=self.api_key)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Executes a web search query on Tavily. Retries up to 3 times with exponential backoff on failure.
        """
        logger.info("Executing Tavily search", query=query, max_results=max_results)
        try:
            response = self.client.search(query=query, max_results=max_results)
            # Response contains a list of results under "results" key
            results = response.get("results", [])
            logger.info("Search complete", results_count=len(results))
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("content", ""),
                    "score": r.get("score", 0.0)
                }
                for r in results
            ]
        except Exception as e:
            logger.error("Tavily search failed", query=query, error=str(e))
            raise e

    def search_and_summarize(self, query: str, max_results: int = 5) -> str:
        """
        Queries Tavily and returns a clean, formatted text summary of results for LLM injection.
        """
        try:
            results = self.search(query, max_results=max_results)
            if not results:
                return f"No search results found for query: '{query}'."
                
            summary_parts = []
            for i, res in enumerate(results):
                summary_parts.append(
                    f"Result {i+1}: {res['title']}\n"
                    f"URL: {res['url']}\n"
                    f"Content: {res['content']}\n"
                )
            return "\n".join(summary_parts)
        except Exception as e:
            logger.error("Search and summarize failed", query=query, error=str(e))
            return f"Search failed due to: {str(e)}"
