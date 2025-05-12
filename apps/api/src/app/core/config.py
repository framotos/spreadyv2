import os
from typing import Dict
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file first to ensure environment variables are set
load_dotenv()

class Settings(BaseSettings):
    # JWT
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    
    # Supabase
    SUPABASE_URL: str = ""
    
    # Gemini API Key
    GEMNINI_APIKEY: str = ""

    # Default base output directory for agent runs
    BASE_OUTPUT_DIR: str = "user_output"

    # Allowed CORS origins
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002", 
        "http://localhost:3003"
    ]

    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_TO_FILE: bool = True
    LOG_FILE_PATH: str = "api.log"
    LOGGER_LEVELS: Dict[str, str] = {
        "uvicorn": "INFO",
        "uvicorn.access": "INFO",
        "fastapi": "INFO",
        "sqlalchemy": "WARNING",
        "httpx": "WARNING",
        "smolagents": "INFO"
    }

    class Config:
        # This allows loading from environment variables automatically
        # Pydantic V2 uses model_config
        # model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')
        # Pydantic V1 uses this Config class
        env_file = os.getenv("ENV_FILE", ".env") # Allow overriding .env file via ENV_FILE env var
        env_file_encoding = 'utf-8'
        extra = 'ignore' # Ignore extra fields from environment variables

settings = Settings() 