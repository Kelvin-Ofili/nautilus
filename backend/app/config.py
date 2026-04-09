from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Nautilus API"
    # Reserved for swapping the in-memory repository for PostgreSQL.
    database_url: str | None = None
    # Comma-separated browser origins for CORS (e.g. http://192.168.1.5:3000 when testing on LAN).
    cors_extra_origins: str = ""
    # When true, registers POST /api/dev/reseed-memory to rebuild MemoryStore from memory_store._seed().
    dev_reseed_memory: bool = False


settings = Settings()
