import unittest
from utils.response import APIEnvelope

class TestAPIResponseEnvelope(unittest.TestCase):
    def test_success_response(self):
        payload = {"user_id": 42, "role": "admin"}
        resp = APIEnvelope.success_response(data=payload, message="User retrieved")

        self.assertTrue(resp.success)
        self.assertEqual(resp.data, payload)
        self.assertEqual(resp.message, "User retrieved")
        self.assertIsNone(resp.error_code)
        self.assertIn("timestamp", resp.model_dump())

    def test_error_response(self):
        resp = APIEnvelope.error_response(error_code="NOT_FOUND", message="Item not found")

        self.assertFalse(resp.success)
        self.assertIsNone(resp.data)
        self.assertEqual(resp.error_code, "NOT_FOUND")
        self.assertEqual(resp.message, "Item not found")

if __name__ == "__main__":
    unittest.main()
