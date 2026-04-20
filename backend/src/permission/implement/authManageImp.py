from permission.interface.authManage import AuthManage
from permission.interface.getUser import GetUser
from permission.interface.sessionManage import SessionManage
from fastapi import FastAPI, Response, Request



class AuthManageImpl(AuthManage):

    def __init__(self, getuser: GetUser, session: SessionManage):
        """
        getuser:  GetUserImp — tìm user trong MongoDB
        session:  SessionManageImpl — quản lý cookie session
        """
        self.getuser_service = getuser
        self.session_service = session

    # ========================
    # Login → trả về cookie token
    # ========================
    def login(self, acc: str, pwd: str) -> dict:
        """
        Xác thực user.
        Trả về:
          - { success: True,  token: <cookie_value>, role: <role>, userId: <id> }
          - { success: False, message: "Invalid account or password" }
        """
        user = self.getuser_service.getuser(acc, pwd)

        if not user:
            return {
                "success": False,
                "message": "Invalid account or password"
            }

        token = self.session_service.createsession(
            userId=user["userId"],
            role=user["role"]
        )

        return {
            "success": True,
            "token":   token,
            "userId":  user["userId"],
            "role":    user["role"]
        }

    # ========================
    # Logout → xoá session
    # ========================
    def logout(self, session: str) -> str:
        deleted = self.session_service.deletesession(session)

        if deleted:
            return "Logout success"

        return "Session not found"

    # ========================
    # Check cookie (middleware)
    # ========================
    def check(self, session: str) -> dict | None:
        return self.session_service.checksession(session)