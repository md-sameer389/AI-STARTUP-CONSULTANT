import time
import structlog
from fastapi import HTTPException, Request, status
from redis.asyncio import Redis, from_url
from backend.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

class RateLimiter:
    def __init__(self):
        self.redis: Redis = from_url(settings.REDIS_URL, decode_responses=True)
        self.limit = 100 if settings.ENVIRONMENT == "development" else 5
        self.window = 3600 # 1 hour in seconds

    async def check_rate_limit(self, request: Request, user_id: str = None) -> None:
        """
        Applies a sliding window rate limiting pattern using Redis sorted sets.
        Key name format: rate_limit:analyze:<user_id_or_ip>
        """
        # If user_id is not provided, use client IP
        client_key = user_id or request.client.host
        key = f"rate_limit:analyze:{client_key}"
        
        current_time = time.time()
        cutoff_time = current_time - self.window
        
        try:
            # Multi/exec transaction pipeline
            async with self.redis.pipeline(transaction=True) as pipe:
                # Remove timestamps older than 1 hour
                pipe.zremrangebyscore(key, 0, cutoff_time)
                # Count remaining timestamps
                pipe.zcard(key)
                # Add current timestamp
                pipe.zadd(key, {str(current_time): current_time})
                # Set key expiry to ensure cleanup
                pipe.expire(key, self.window)
                
                # Execute pipeline
                _, request_count, _, _ = await pipe.execute()
                
            if request_count >= self.limit:
                logger.warning("Rate limit exceeded", user_key=client_key, count=request_count)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.limit} requests per hour allowed."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Rate limiting service failure, bypassing limit", error=str(e))
            # Gracefully bypass rate limiter on Redis failure to avoid blocking users
            pass

rate_limiter = RateLimiter()
