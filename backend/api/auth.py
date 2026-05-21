from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import select

try:
    from ..db import SessionLocal
    from ..models.user import User
    from ..models.cv import CV
except ImportError:
    from db import SessionLocal
    from models.user import User
    from models.cv import CV


router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = Field(pattern="^(user|admin)$")


class LoginRequest(BaseModel):
    email: str
    password: str


class CVSaveRequest(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    education: str | None = None
    experience: str | None = None
    experience_years: str | int | float | None = None
    skills: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)


class PurchaseRequest(BaseModel):
    product_name: str


SEED_USERS = [
    {"full_name": "Admin", "email": "admin@biznesbayt.az", "password": "admin123", "role": "admin"},
    {"full_name": "Test İstifadəçi", "email": "user@test.az", "password": "user123", "role": "user"},
]


def _to_public_user(user: User) -> dict[str, Any]:
    return {
        "id": str(user.id),
        "name": user.full_name,
        "email": user.email,
        "role": user.purpose or "user",
        "purchases": user.purchases or [],
    }


def _set_session_cookie(response: Response, user_id: int) -> None:
    response.set_cookie(
        key="bb_user_id",
        value=str(user_id),
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
    )


@router.get("/seed")
def seed_users() -> dict[str, Any]:
    session = SessionLocal()
    try:
        created = 0
        for seed in SEED_USERS:
            existing = session.execute(select(User).where(User.email == seed["email"])).scalars().first()
            if existing:
                continue
            session.add(User(
                full_name=seed["full_name"],
                email=seed["email"],
                password_hash=seed["password"],
                purpose=seed["role"],
                purchases=[],
            ))
            created += 1
        session.commit()
        return {"created": created}
    finally:
        session.close()


@router.post("/users/register")
def register(request: RegisterRequest, response: Response) -> dict[str, Any]:
    session = SessionLocal()
    try:
        existing = session.execute(select(User).where(User.email == request.email)).scalars().first()
        if existing:
            raise HTTPException(status_code=409, detail="Bu email artıq qeydiyyatdadır")
        user = User(
            full_name=request.name,
            email=request.email,
            password_hash=request.password,
            purpose=request.role,
            purchases=[],
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        _set_session_cookie(response, user.id)
        return _to_public_user(user)
    finally:
        session.close()


@router.post("/users/login")
def login(request: LoginRequest, response: Response) -> dict[str, Any]:
    session = SessionLocal()
    try:
        user = session.execute(
            select(User).where(User.email == request.email, User.password_hash == request.password)
        ).scalars().first()
        if not user:
            raise HTTPException(status_code=401, detail="Email və ya şifrə yanlışdır")
        _set_session_cookie(response, user.id)
        return _to_public_user(user)
    finally:
        session.close()


@router.get("/users/me")
def current_user(request: Request) -> dict[str, Any] | None:
    raw_user_id = request.cookies.get("bb_user_id")
    if not raw_user_id:
        return None
    session = SessionLocal()
    try:
        try:
            user_id = int(raw_user_id)
        except ValueError:
            return None
        user = session.get(User, user_id)
        return _to_public_user(user) if user else None
    finally:
        session.close()


@router.post("/users/logout")
def logout(response: Response) -> dict[str, bool]:
    response.delete_cookie("bb_user_id")
    return {"ok": True}


@router.get("/users")
def list_users() -> list[dict[str, Any]]:
    session = SessionLocal()
    try:
        users = session.execute(select(User).order_by(User.created_at.desc())).scalars().all()
        return [_to_public_user(user) for user in users]
    finally:
        session.close()


@router.get("/users/{user_id}/cv")
def get_cv(user_id: int) -> dict[str, Any] | None:
    session = SessionLocal()
    try:
        cv = session.execute(select(CV).where(CV.user_id == user_id)).scalars().first()
        if not cv:
            return None
        return {
            "id": cv.id,
            "user_id": cv.user_id,
            "full_name": cv.full_name,
            "email": cv.email,
            "phone": cv.phone,
            "education": cv.education,
            "experience": cv.experience,
            "skills": cv.skills or [],
            "projects": cv.projects,
            "created_at": cv.created_at,
            "updated_at": cv.updated_at,
        }
    finally:
        session.close()


@router.post("/users/{user_id}/cv")
def save_cv(user_id: int, request: CVSaveRequest) -> dict[str, Any]:
    session = SessionLocal()
    try:
        cv = session.execute(select(CV).where(CV.user_id == user_id)).scalars().first()
        experience_value = request.experience or (str(request.experience_years) if request.experience_years is not None else None)
        if cv:
            cv.full_name = request.full_name
            cv.email = request.email
            cv.phone = request.phone
            cv.education = request.education
            cv.experience = experience_value
            cv.skills = request.skills
            cv.projects = ", ".join(request.projects)
        else:
            cv = CV(
                user_id=user_id,
                full_name=request.full_name,
                email=request.email,
                phone=request.phone,
                education=request.education,
                experience=experience_value,
                skills=request.skills,
                projects=", ".join(request.projects),
            )
            session.add(cv)
        session.commit()
        session.refresh(cv)
        return {
            "id": cv.id,
            "user_id": cv.user_id,
            "full_name": cv.full_name,
            "email": cv.email,
            "phone": cv.phone,
            "education": cv.education,
            "experience": cv.experience,
            "skills": cv.skills or [],
            "projects": cv.projects,
            "created_at": cv.created_at,
            "updated_at": cv.updated_at,
        }
    finally:
        session.close()


@router.post("/users/{user_id}/purchase")
def add_purchase(user_id: int, request: PurchaseRequest) -> dict[str, Any]:
    session = SessionLocal()
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        purchases = list(user.purchases or [])
        if request.product_name not in purchases:
            purchases.append(request.product_name)
        user.purchases = purchases
        session.commit()
        session.refresh(user)
        return _to_public_user(user)
    finally:
        session.close()


@router.delete("/users/{user_id}/purchase")
def remove_purchase(user_id: int, request: PurchaseRequest) -> dict[str, Any]:
    session = SessionLocal()
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        purchases = [p for p in (user.purchases or []) if p != request.product_name]
        user.purchases = purchases
        session.commit()
        session.refresh(user)
        return _to_public_user(user)
    finally:
        session.close()
