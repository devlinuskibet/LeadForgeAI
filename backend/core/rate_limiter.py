import time
from typing import Dict, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiter middleware per client IP.
    Limits requests per minute window.
    """
    def __init__(self, app, requests_per_minute: int = 120):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.client_records: Dict[str, Tuple[int, float]] = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        count, window_start = self.client_records.get(client_ip, (0, now))
        
        # Reset window if 60 seconds have elapsed
        if now - window_start > 60:
            count = 0
            window_start = now

        if count >= self.requests_per_minute:
            retry_after = int(60 - (now - window_start))
            return JSONResponse(
                status_code=429,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Please try again later.",
                    "retry_after_seconds": max(1, retry_after)
                },
                headers={"Retry-After": str(max(1, retry_after))}
            )

        self.client_records[client_ip] = (count + 1, window_start)
        return await call_next(request)
