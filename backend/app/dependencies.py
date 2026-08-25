from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import engine
from app.models import User
from app.security import decode_access_token


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    with Session(engine) as session:
        user = session.get(User, user_id)

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found",
            )

        session.expunge(user)
        return user