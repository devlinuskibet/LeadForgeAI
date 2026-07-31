from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_deals_endpoint():
    response = client.get("/api/deals/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_deal_metrics_endpoint():
    response = client.get("/api/deals/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_open_value" in data
    assert "win_rate_percentage" in data
