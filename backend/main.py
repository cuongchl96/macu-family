import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import engine, Base, AsyncSessionLocal
from app.api import auth_router, wealth_router, notifications_router
from app.core.config import settings
from app.models import wealth  # registers all models with Base
from app.services.notification_checker import run_daily_checks

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def _scheduled_notifications():
    async with AsyncSessionLocal() as db:
        try:
            await run_daily_checks(db)
        except Exception as e:
            logger.error(f"Notification check failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Run notification checks every day at 08:00
    scheduler.add_job(
        _scheduled_notifications,
        CronTrigger(hour=8, minute=0),
        id="daily_notifications",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — daily notifications at 08:00")

    yield

    scheduler.shutdown(wait=False)


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(wealth_router.router, prefix=settings.API_V1_STR)
app.include_router(notifications_router.router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {"status": "ok", "message": f"{settings.PROJECT_NAME} is up and running!"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
