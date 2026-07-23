import unittest
from utils.audit import AuditLogger

class TestAuditLogger(unittest.TestCase):
    def test_log_event_structure(self):
        event = AuditLogger.log_event(
            action="CREATE_COMPANY",
            entity_type="company",
            entity_id="12345",
            user_id="user_789",
            metadata={"name": "Acme Inc"}
        )

        self.assertEqual(event["action"], "CREATE_COMPANY")
        self.assertEqual(event["entity_type"], "company")
        self.assertEqual(event["entity_id"], "12345")
        self.assertEqual(event["user_id"], "user_789")
        self.assertEqual(event["metadata"]["name"], "Acme Inc")
        self.assertIn("audit_id", event)
        self.assertIn("timestamp", event)

    def test_log_event_default_metadata(self):
        event = AuditLogger.log_event(action="LOGOUT", entity_type="user")
        self.assertEqual(event["metadata"], {})
        self.assertIsNone(event["entity_id"])
        self.assertIsNone(event["user_id"])

if __name__ == "__main__":
    unittest.main()
