from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

bearer_scheme = HTTPBearer()


def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": "family", "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> None:
    try:
        jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token không hợp lệ hoặc đã hết hạn")
