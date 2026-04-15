import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.api import auth_router, wealth_router
from app.core.config import settings
from app.models import wealth  # Import models to register them with SQLAlchemy Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create missing tables in SQLite on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Application teardown can go here if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Enable CORS for frontend applications (e.g. Vite on localhost:5173 / localhost:8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the REST API routes at /api
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(wealth_router.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} is up and running!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
