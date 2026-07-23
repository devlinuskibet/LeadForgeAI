import pytest
from fastapi.testclient import TestClient
from main import app
from core.database import get_db

class MockDB:
    def execute(self, query):
        return True

def override_get_db():
    try:
        yield MockDB()
    finally:
        pass

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
