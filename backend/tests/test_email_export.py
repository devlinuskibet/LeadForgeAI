import pytest
from services.export_service import export_email_messages_to_csv
from models.email_message import EmailMessage

def test_export_email_messages_to_csv_headers():
    csv_content = export_email_messages_to_csv([])
    lines = csv_content.strip().split("\r\n")
    headers = lines[0].split(",")
    assert "Opened At" in headers
    assert "Replied At" in headers
    assert "Status" in headers
