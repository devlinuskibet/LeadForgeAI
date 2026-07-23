import unittest
import time
from unittest.mock import MagicMock, AsyncMock
from core.rate_limiter import RateLimiterMiddleware

class TestRateLimiterMiddleware(unittest.TestCase):
    def setUp(self):
        self.mock_app = MagicMock()
        self.middleware = RateLimiterMiddleware(self.mock_app, requests_per_minute=2)

    def test_rate_limiter_allows_under_limit(self):
        request = MagicMock()
        request.client.host = "127.0.0.1"
        call_next = AsyncMock(return_value="OK")

        import asyncio
        res1 = asyncio.run(self.middleware.dispatch(request, call_next))
        res2 = asyncio.run(self.middleware.dispatch(request, call_next))

        self.assertEqual(res1, "OK")
        self.assertEqual(res2, "OK")

    def test_rate_limiter_blocks_over_limit(self):
        request = MagicMock()
        request.client.host = "192.168.1.1"
        call_next = AsyncMock(return_value="OK")

        import asyncio
        asyncio.run(self.middleware.dispatch(request, call_next))
        asyncio.run(self.middleware.dispatch(request, call_next))
        res3 = asyncio.run(self.middleware.dispatch(request, call_next))

        self.assertEqual(res3.status_code, 429)

if __name__ == "__main__":
    unittest.main()
