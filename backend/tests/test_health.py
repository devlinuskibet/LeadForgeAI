import unittest
from unittest.mock import MagicMock
from api.health import health_check
from core.middleware import SecurityHeadersMiddleware

class TestSystemHealth(unittest.TestCase):
    def test_health_check_success(self):
        mock_db = MagicMock()
        mock_db.execute.return_value = True
        
        result = health_check(db=mock_db)
        
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["service"], "LeadForgeAI API")
        self.assertEqual(result["database"], "healthy")
        self.assertIn("uptime_seconds", result)
        self.assertIn("environment", result)

    def test_health_check_database_failure(self):
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("Connection timed out")
        
        result = health_check(db=mock_db)
        
        self.assertEqual(result["status"], "degraded")
        self.assertTrue(result["database"].startswith("unhealthy"))

if __name__ == "__main__":
    unittest.main()
