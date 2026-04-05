from permission.interface.authManage import AuthManage
from permission.interface.getUser import GetUser
from permission.implement.sessionManageImp import SessionManageImpl


class AuthManageImpl(AuthManage):

    def __init__(self, getuser: GetUser, session: SessionManageImpl):
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
            "token":   token,       # → set vào cookie: Set-Cookie: session=<token>
            "userId":  user["userId"],
            "role":    user["role"]
        }

    # ========================
    # Logout → xoá session
    # ========================
    def logout(self, session: str) -> str:
        """
        Xoá session theo cookie token.
        """
        deleted = self.session_service.deletesession(session)

        if deleted:
            return "Logout success"

        return "Session not found"

    # ========================
    # Check cookie (middleware)
    # ========================
    def check(self, session: str) -> dict | None:
        """
        Dùng ở middleware để kiểm tra mỗi request.
        Trả về { userId, role } nếu hợp lệ, None nếu không.
        """
        return self.session_service.checksession(session)
