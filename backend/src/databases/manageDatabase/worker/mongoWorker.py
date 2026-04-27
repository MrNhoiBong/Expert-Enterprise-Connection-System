from ..interface.daoWorker import DAOWorker


class MongoWorker(DAOWorker):

    def __init__(self, dao):
        self.dao = dao

    def can_handle(self, event: str):
        return event in {
            "show_info",
            "get_all",
            "find",
            "search"
        }

    def handle(self, event: str, data: dict = None):

        data = data or {}

        if event == "show_info":
            return self.dao.showinfo()

        elif event == "get_all":
            return self.dao.show_collections()

        elif event == "find":
            return self.dao.find(
                data.get("collection"),
                data.get("id")
            )

        elif event == "search":
            return self.dao.search(
                data.get("collection"),
                data.get("criteria", {})
            )

        else:
            raise ValueError("Unknown event")

        # =========================
    # 5.1 EXPERT SKILL LIST
    # =========================
    print("\n===== EXPERT SKILL LIST =====")
    # Lấy tất cả experts trước
    experts_col = db["experts"]
    experts = list(experts_col.find({}, {"expertID": 1, "name": 1, "skills": 1, "_id": 0}))
    if not experts:
        print("❌ No experts found")
    else:
        for e in experts:
            expert_id = e.get("expertID", "?")
            name      = e.get("name", "Unknown")
            skills    = mongoDao.get_expert_skills(expert_id)
            skills_str = ", ".join(skills) if skills else "— no skills"
            print(f"  [{expert_id}] {name}: {skills_str}")