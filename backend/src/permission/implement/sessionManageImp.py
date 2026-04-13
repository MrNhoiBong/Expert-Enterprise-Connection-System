import hashlib
import time
import uuid
import json
import os

from permission.interface.sessionManage import SessionManage

SESSION_FILE = "sessions.json"   # file dùng chung giữa 3 server

class SessionManageImpl(SessionManage):

    def __init__(self):
        """
        Lưu session trong memory (dict).
        Key:   session token (cookie value)
        Value: { userId, role, createdAt, expiresAt }
        """
        self._sessions: dict = {}
        self.session_lifetime = 3600  # 1 giờ (giây)

    # ========================
    # Tạo session → trả về cookie token
    # ========================
    def _load(self) -> dict:
        if not os.path.exists(SESSION_FILE):
            return {}
        with open(SESSION_FILE, "r") as f:
            return json.load(f)

    def _save(self, sessions: dict):
        with open(SESSION_FILE, "w") as f:
            json.dump(sessions, f)

    def createsession(self, userId: str, role: str = "unknown") -> str:
        token = hashlib.sha256(
            f"{userId}-{uuid.uuid4()}-{time.time()}".encode()
        ).hexdigest()

        sessions = self._load()
        sessions[token] = {
            "userId":    userId,
            "role":      role,
            "expiresAt": time.time() + 3600
        }
        self._save(sessions)
        return token

    def checksession(self, session: str) -> dict | None:
        sessions = self._load()
        if session not in sessions:
            return None

        data = sessions[session]
        if time.time() > data["expiresAt"]:
            del sessions[session]
            self._save(sessions)
            return None

        return {"userId": data["userId"], "role": data["role"]}

    def deletesession(self, session: str) -> bool:
        sessions = self._load()
        if session in sessions:
            del sessions[session]
            self._save(sessions)
            return True
        return False

    # ========================
    # UTIL
    # ========================
    def _generate_token(self, userId: str) -> str:
        raw = f"{userId}-{uuid.uuid4()}-{time.time()}"
        return hashlib.sha256(raw.encode()).hexdigest()
