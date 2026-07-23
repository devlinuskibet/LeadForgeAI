import unittest
from unittest.mock import MagicMock
from services.export_service import export_companies_to_csv, export_contacts_to_csv

class TestExportService(unittest.TestCase):
    def test_export_companies_to_csv(self):
        c1 = MagicMock()
        c1.id = 1
        c1.name = "Acme Corp"
        c1.domain = "acme.com"
        c1.industry = "Technology"
        c1.employee_count = 100
        c1.city = "San Francisco"
        c1.state = "CA"
        c1.country = "USA"
        c1.website = "https://acme.com"
        c1.created_at = "2026-01-01 00:00:00"

        csv_out = export_companies_to_csv([c1])
        lines = csv_out.strip().split("\r\n")
        if len(lines) == 1:
            lines = csv_out.strip().split("\n")
            
        self.assertIn("ID,Name,Domain", lines[0])
        self.assertIn("1,Acme Corp,acme.com,Technology,100,San Francisco,CA,USA,https://acme.com", lines[1])

    def test_export_contacts_to_csv(self):
        ct1 = MagicMock()
        ct1.id = 10
        ct1.first_name = "Jane"
        ct1.last_name = "Doe"
        ct1.email = "jane@acme.com"
        ct1.phone = "+15550199"
        ct1.title = "VP of Sales"
        ct1.company_id = 1
        ct1.created_at = "2026-01-02 00:00:00"

        csv_out = export_contacts_to_csv([ct1])
        lines = csv_out.strip().split("\r\n")
        if len(lines) == 1:
            lines = csv_out.strip().split("\n")

        self.assertIn("ID,First Name,Last Name,Email", lines[0])
        self.assertIn("10,Jane,Doe,jane@acme.com,+15550199,VP of Sales,1", lines[1])

if __name__ == "__main__":
    unittest.main()
