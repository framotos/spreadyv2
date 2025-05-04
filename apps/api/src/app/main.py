from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging

from .core.config import settings

# Configure logging (can be refined later)
logging.basicConfig(level=settings.LOG_LEVEL.upper())
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title="NeuroFinance API", 
        # Add other metadata later if needed
        # version="0.1.0",
        # description="API for NeuroFinance agent"
    )

    # Add CORS middleware
    logger.info(f"Configuring CORS for origins: {settings.ALLOWED_ORIGINS}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.ALLOWED_ORIGINS], # Ensure origins are strings
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount static files (outputs)
    # Ensure the directory exists
    # TODO: Move this logic potentially? Or ensure directory is created elsewhere.
    # os.makedirs(settings.BASE_OUTPUT_DIR, exist_ok=True) 
    logger.info(f"Mounting static directory: /{settings.BASE_OUTPUT_DIR}")
    app.mount(
        f"/{settings.BASE_OUTPUT_DIR}", 
        StaticFiles(directory=settings.BASE_OUTPUT_DIR), 
        name=settings.BASE_OUTPUT_DIR
    )

    # Include routers
    from .routers import sessions, ask # Import the ask router
    app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
    app.include_router(ask.router, prefix="/ask", tags=["ask"]) # Include the ask router

    # Add root/health check endpoint
    @app.get("/health", tags=["health"])
    async def health_check():
        return {"status": "ok"}

    # TODO: Add exception handlers here
    # from .core import exceptions
    # exceptions.register_handlers(app)

    logger.info("FastAPI app created.")
    return app

# Create the app instance immediately for uvicorn discovery if run directly
# However, using the factory pattern (create_app) is generally preferred for testing and flexibility.
app = create_app()

# If you want to run this directly using `python -m app.main` (less common with FastAPI)
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="127.0.0.1", port=8000) 