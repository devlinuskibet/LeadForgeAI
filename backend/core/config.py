from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LeadForgeAI"
    DATABASE_URL: str = "postgresql://user:password@localhost/leadforge"
    SECRET_KEY: str = "supersecretkey"  # change in prod
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"

settings = Settings()
