from permission.interface.getUser import GetUser


class GetUserImpl(GetUser):

    def __init__(self, db):
        self.db = db   # ✅ lưu db, không phải collection
        self.user_collections = ["experts", "enterprises", "foundation", "createFund"]

    def getuser(self, acc: str, pwd: str) -> dict | None:

        role_map = {
            "experts":     "expert",
            "enterprises": "enterprise",
            "foundation":  "foundation",
            "createFund":  "funding"
        }

        for col_name in self.user_collections:
            col = self.db[col_name]   # ✅ lấy collection từ db mỗi lần
            result = col.find_one({
                "account":  acc,
                "password": pwd
            })

            if result:
                user_id = (
                    result.get("expertID") or
                    result.get("enterpriseID") or
                    result.get("FoundID")
                )
                return {
                    "userId":  user_id,
                    "account": acc,
                    "role":    role_map[col_name]
                }

        return None