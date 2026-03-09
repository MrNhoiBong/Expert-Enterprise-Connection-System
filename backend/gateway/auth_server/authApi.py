from fastapi import APIRouter, Body
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    username: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(data: RegisterRequest):
    return {"message": "Register success", "data": data}


@router.post("/login")
def login(data: LoginRequest):
    return {"message": "Login success", "token": "fake-jwt-token"}


@router.post("/logout")
def logout():
    return {"message": "Logout success"}


@router.patch("/username")
def change_username(new_username: str = Body(...)):
    return {"message": "Username updated", "new_username": new_username}


@router.patch("/password")
def change_password(new_password: str = Body(...)):
    return {"message": "Password updated"}
