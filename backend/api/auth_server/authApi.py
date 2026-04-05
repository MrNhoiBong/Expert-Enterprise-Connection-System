from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from api.deps import get_factory, get_current_user
from businessLogic.serviceFactory import ServiceFactory
import datetime

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


# ===== Schemas =====

class RegisterRequest(BaseModel):
    account:      str
    password:     str
    role:         str        # "expert" | "enterprise" | "foundation"
    name:         str
    email:        str = None
    company_name: str = None  # enterprise only


class LoginRequest(BaseModel):
    account:  str
    password: str


class ChangeUsernameRequest(BaseModel):
    new_account: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


# ===== Register =====

@router.post("/register", status_code=201)
def register(body: RegisterRequest,
             factory: ServiceFactory = Depends(get_factory)):

    col_map = {
        "expert":     "experts",
        "enterprise": "enterprises",
        "foundation": "foundation"
    }
    if body.role not in col_map:
        raise HTTPException(400, "role phải là: expert | enterprise | foundation")

    # Kiểm tra account tồn tại chưa
    for col_name in col_map.values():
        if factory.dao._get_collection(col_name).find_one({"account": body.account}):
            raise HTTPException(409, "Account đã tồn tại")

    col = factory.dao._get_collection(col_map[body.role])
    count = col.count_documents({})
    next_id = count + 1

    if body.role == "expert":
        doc = {
            "expertID":       f"EXP{str(next_id).zfill(3)}",
            "name":           body.name,
            "email":          body.email or "",
            "account":        body.account,
            "password":       body.password,
            "skills":         [],
            "experience":     0,
            "profileSummary": ""
        }
    elif body.role == "enterprise":
        doc = {
            "enterpriseID": f"ENT{str(next_id).zfill(3)}",
            "company_name": body.company_name or body.name,
            "email":        body.email or "",
            "account":      body.account,
            "password":     body.password,
            "phone":        "",
            "tax_code":     "",
            "founded_year": datetime.date.today().year
        }
    else:  # foundation
        doc = {
            "FoundID":     f"FND{str(next_id).zfill(3)}",
            "name":        body.name,
            "type":        "non-profit",
            "createDate":  datetime.date.today().isoformat(),
            "account":     body.account,
            "password":    body.password,
            "description": ""
        }

    col.insert_one(doc)
    return {"message": "Đăng ký thành công", "account": body.account, "role": body.role}


# ===== Login =====

@router.post("/login")
def login(body: LoginRequest,
          response: Response,
          factory: ServiceFactory = Depends(get_factory)):

    result = factory.auth.login(body.account, body.password)

    if not result["success"]:
        raise HTTPException(401, "Sai account hoặc password")

    # Set cookie session
    response.set_cookie(
        key="session",
        value=result["token"],
        httponly=True,       # không cho JS đọc
        max_age=3600,        # 1 giờ
        samesite="lax"
    )
    return {
        "message": "Đăng nhập thành công",
        "userId":  result["userId"],
        "role":    result["role"]
    }


# ===== Logout =====

@router.post("/logout")
def logout(response: Response,
           current_user: dict = Depends(get_current_user),
           factory: ServiceFactory = Depends(get_factory)):

    factory.auth.logout(current_user.get("token", ""))
    response.delete_cookie("session")
    return {"message": "Đăng xuất thành công"}


# ===== Change Username =====

@router.patch("/username")
def change_username(body: ChangeUsernameRequest,
                    current_user: dict = Depends(get_current_user),
                    factory: ServiceFactory = Depends(get_factory)):

    col_map = {
        "expert":     ("experts",     "expertID"),
        "enterprise": ("enterprises", "enterpriseID"),
        "foundation": ("foundation",  "FoundID"),
    }
    col_name, id_field = col_map[current_user["role"]]

    # Kiểm tra account mới chưa tồn tại
    for c in col_map:
        if factory.dao._get_collection(col_map[c][0]).find_one({"account": body.new_account}):
            raise HTTPException(409, "Account đã tồn tại")

    factory.dao._get_collection(col_name).update_one(
        {id_field: current_user["userId"]},
        {"$set": {"account": body.new_account}}
    )
    return {"message": "Đổi username thành công"}


# ===== Change Password =====

@router.patch("/password")
def change_password(body: ChangePasswordRequest,
                    current_user: dict = Depends(get_current_user),
                    factory: ServiceFactory = Depends(get_factory)):

    col_map = {
        "expert":     ("experts",     "expertID"),
        "enterprise": ("enterprises", "enterpriseID"),
        "foundation": ("foundation",  "FoundID"),
    }
    col_name, id_field = col_map[current_user["role"]]
    col = factory.dao._get_collection(col_name)

    user = col.find_one({id_field: current_user["userId"]})
    if not user or user["password"] != body.old_password:
        raise HTTPException(400, "Mật khẩu cũ không đúng")

    col.update_one(
        {id_field: current_user["userId"]},
        {"$set": {"password": body.new_password}}
    )
    return {"message": "Đổi mật khẩu thành công"}