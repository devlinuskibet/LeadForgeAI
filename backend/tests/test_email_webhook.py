from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_webhook_invalid_payload():
    response = client.post("/api/emails/webhook/mock", json={
        "invalid_field": "test"
    })
    assert response.status_code == 422 # Validation error for missing required fields
