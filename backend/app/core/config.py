from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MacuFam Wealth API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str = "sqlite+aiosqlite:///./wealth.db"

    # Family PIN (8 digits). Override via APP_PIN env var in production.
    APP_PIN: str = "12345678"

    # Comma-separated list of allowed frontend origins.
    ALLOWED_ORIGINS: str = "http://localhost:8080,http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
