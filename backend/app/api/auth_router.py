from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class PinRequest(BaseModel):
    pin: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/pin", response_model=TokenResponse)
async def login_with_pin(body: PinRequest) -> TokenResponse:
    if body.pin != settings.APP_PIN:
        raise HTTPException(status_code=401, detail="PIN không đúng")
    return TokenResponse(access_token=create_access_token())
