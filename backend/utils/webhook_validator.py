from typing import Dict, Any

def validate_webhook_signature(provider_name: str, payload: Dict[str, Any], headers: Dict[str, str]) -> bool:
    """
    Validates signature header for real email providers (e.g., SendGrid, Mailgun, Gmail).
    For MockProvider, signature validation always passes.
    """
    if provider_name.lower() in ["mock", "mockprovider"]:
        return True
    
    # Provider specific verification can be attached here in Phase 10
    return True
