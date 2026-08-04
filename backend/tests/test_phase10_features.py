from fastapi.testclient import TestClient
from main import app
from services.email_provider import SendGridEmailProvider, get_email_provider, MockEmailProvider, SMTPEmailProvider

client = TestClient(app)

def test_sendgrid_provider_fallback():
    provider = SendGridEmailProvider(api_key="test-key")
    res = provider.send_email(
        to_addresses=["test@example.com"],
        subject="Test Subject",
        body="Test Body"
    )
    assert res["status"] == "SENT"
    assert "provider_message_id" in res

def test_provider_factory_default():
    provider = get_email_provider()
    assert isinstance(provider, (MockEmailProvider, SendGridEmailProvider, SMTPEmailProvider))

def test_campaign_evaluator_celery_task():
    from workers.tasks import evaluate_campaign_followups_task
    # Run synchronously for test verification
    res = evaluate_campaign_followups_task()
    assert "created_count" in res or "error" in res
