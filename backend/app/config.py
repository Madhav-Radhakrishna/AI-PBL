import os
try:
    if os.getenv("USE_PYDANTIC_SETTINGS"):
        from pydantic_settings import BaseSettings
    else:
        BaseSettings = object
except ImportError:
    BaseSettings = object

class Settings:
    PROJECT_NAME: str = "Intelligent Disaster Evacuation Route Planning System"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./disaster_evacuation.db")

settings = Settings()
