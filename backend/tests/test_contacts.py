import unittest
import uuid
from unittest.mock import MagicMock
from api.contacts import bulk_create_contacts, ContactCreate
from core.errors import AppException

class TestContactsAPI(unittest.TestCase):
    def test_bulk_create_contacts_empty(self):
        mock_db = MagicMock()
        res = bulk_create_contacts([], db=mock_db)
        self.assertEqual(res.imported_count, 0)
        self.assertEqual(res.contacts, [])

    def test_bulk_create_contacts_no_org(self):
        mock_db = MagicMock()
        mock_db.query.return_value.first.return_value = None
        
        c1 = ContactCreate(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            company_id=uuid.uuid4()
        )
        
        with self.assertRaises(AppException) as ctx:
            bulk_create_contacts([c1], db=mock_db)
        
        self.assertEqual(ctx.exception.code, "NO_ORG")

    def test_bulk_create_contacts_success(self):
        mock_db = MagicMock()
        mock_org = MagicMock()
        mock_org.id = uuid.uuid4()
        mock_db.query.return_value.first.return_value = mock_org
        
        def mock_refresh(obj):
            if not getattr(obj, 'id', None):
                obj.id = uuid.uuid4()

        mock_db.refresh.side_effect = mock_refresh
        
        c1 = ContactCreate(
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            role="Director",
            company_id=uuid.uuid4()
        )
        
        res = bulk_create_contacts([c1], db=mock_db)
        self.assertEqual(res.imported_count, 1)
        self.assertEqual(len(res.contacts), 1)
        self.assertIsNotNone(res.contacts[0].id)

if __name__ == "__main__":
    unittest.main()
