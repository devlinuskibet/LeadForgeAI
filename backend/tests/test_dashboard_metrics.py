from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_daily_briefing_endpoint():
    response = client.get("/api/dashboard/daily-briefing")
    assert response.status_code == 200
    data = response.json()
    assert "emails_sent" in data
    assert "emails_opened" in data
    assert "emails_replied" in data
