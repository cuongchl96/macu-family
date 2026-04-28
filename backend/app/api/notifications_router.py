from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.core.security import verify_token
from app.models.wealth import NotificationSettings
from app.services.telegram import send_message
from app.services.notification_checker import run_daily_checks

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationSettingsSchema(BaseModel):
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    enabled: bool = True
    notify_realestate: bool = True
    notify_savings: bool = True
    notify_goals: bool = True
    notify_monthly: bool = True
    days_before_alert: int = 7

    model_config = {"from_attributes": True}


async def _get_or_create(db: AsyncSession) -> NotificationSettings:
    result = await db.execute(select(NotificationSettings).limit(1))
    row = result.scalar_one_or_none()
    if not row:
        row = NotificationSettings()
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


@router.get("/settings", response_model=NotificationSettingsSchema, dependencies=[Depends(verify_token)])
async def get_settings(db: AsyncSession = Depends(get_db)):
    return await _get_or_create(db)


@router.post("/settings", response_model=NotificationSettingsSchema, dependencies=[Depends(verify_token)])
async def save_settings(payload: NotificationSettingsSchema, db: AsyncSession = Depends(get_db)):
    row = await _get_or_create(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    await db.commit()
    await db.refresh(row)
    return row


@router.post("/test", dependencies=[Depends(verify_token)])
async def test_notification(db: AsyncSession = Depends(get_db)):
    row = await _get_or_create(db)
    if not row.telegram_bot_token or not row.telegram_chat_id:
        raise HTTPException(400, "Chưa cấu hình Bot Token và Chat ID")
    result = await send_message(
        row.telegram_bot_token,
        row.telegram_chat_id,
        "✅ <b>MacuFam Wealth</b>\n\nKết nối Telegram thành công! Bạn sẽ nhận thông báo tài chính tại đây.",
    )
    if not result.get("ok"):
        raise HTTPException(400, f"Telegram lỗi: {result.get('description', 'Unknown error')}")
    return {"ok": True}


@router.post("/trigger", dependencies=[Depends(verify_token)])
async def trigger_now(db: AsyncSession = Depends(get_db)):
    await run_daily_checks(db)
    return {"ok": True, "message": "Đã gửi tất cả thông báo hiện có"}
