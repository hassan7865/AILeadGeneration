from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.models.entities import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserOut
from app.services.auth_service import authenticate_user, register_user
from app.utils.response import ok

router = APIRouter(prefix="/auth", tags=["Auth"])


def _set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=settings.cookie_secure, samesite=settings.cookie_samesite)
    response.set_cookie("refresh_token", refresh, httponly=True, secure=settings.cookie_secure, samesite=settings.cookie_samesite)


@router.post("/register")
async def register(payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db_session)):
    try:
        user = await register_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    _set_auth_cookies(response, access, refresh)
    return ok(UserOut.model_validate(user), "Registered")


@router.post("/login")
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db_session)):
    try:
        user, access, refresh = await authenticate_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    _set_auth_cookies(response, access, refresh)
    return ok(UserOut.model_validate(user), "Logged in")


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return ok(message="Logged out")


@router.post("/refresh")
async def refresh(response: Response, refresh_token: str | None = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    try:
        payload = decode_token(refresh_token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token") from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    access = create_access_token(payload["sub"])
    response.set_cookie("access_token", access, httponly=True, secure=settings.cookie_secure, samesite=settings.cookie_samesite)
    return ok(message="Token refreshed")


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return ok(UserOut.model_validate(user), "Current user")
