from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "ksp_crime"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres123"

    GEMINI_API_KEY: str = ""

    # JWT
    SECRET_KEY: str = "changeme-use-a-long-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # App
    APP_NAME: str = "KSP Crime Intelligence"
    DEBUG: bool = True
    RUN_ENV: str = "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    @property
    def DATABASE_URL(self):
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


@lru_cache
def get_settings():
    settings = Settings()

    print("========== SETTINGS ==========")
    print(settings.DATABASE_URL)
    print("==============================")

    return settings