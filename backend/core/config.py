from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LeadForgeAI"
    VERSION: str = "0.9.0"
    DATABASE_URL: str = "postgresql://user:password@localhost/leadforge"
    SECRET_KEY: str = "supersecretkey"  # change in prod
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str = "redis://localhost:6379/0"
    ENVIRONMENT: str = "development"
    AI_PROVIDER: str = "mock"
    AI_DEFAULT_MODEL: str = "gemini-1.5-flash"
    AI_MAX_RETRIES: int = 3
    AI_TIMEOUT_MS: int = 30000
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    GOOGLE_PLACES_API_KEY: str | None = None
    SENDGRID_API_KEY: str | None = None
    DEFAULT_SENDER_EMAIL: str = "outreach@leadforge.ai"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
