import os

class AIConfig:
    AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")
    DEFAULT_MODEL = os.getenv("AI_DEFAULT_MODEL", "mock-model-v1")
    MAX_RETRIES = int(os.getenv("AI_MAX_RETRIES", 3))
    TIMEOUT_MS = int(os.getenv("AI_TIMEOUT_MS", 30000))

ai_config = AIConfig()
