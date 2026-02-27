from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    jwt_secret: str = 'dev-secret-key-change-me'
    jwt_alg: str = 'HS256'
    jwt_exp_minutes: int = 60

    admin_user: str = 'admin'
    admin_pass: str = 'jarvis123'

    backend_host: str = '0.0.0.0'
    backend_port: int = 8000
    frontend_origin: str = 'http://localhost:5173'

    database_url: str = 'postgresql+psycopg://postgres:postgres@localhost:5432/omniel'
    redis_url: str = 'redis://localhost:6379/0'

    weather_api_key: str = ''
    weather_base_url: str = 'https://api.openweathermap.org/data/2.5/weather'

    openai_api_key: str = ''
    openai_chat_model: str = 'gpt-4o-mini'
    openai_embedding_model: str = 'text-embedding-3-small'

    ingest_async: bool = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
