from databases.interfaceDao.dataDao import DataDAO


class ExpertService:

    def __init__(self, dao: DataDAO):
        self.dao = dao
        self.col = "experts"

    # ===== Lấy thông tin expert =====

    def get_by_id(self, expert_id: str) -> dict | None:
        result = self.dao.get(collection_name=self.col, expert_id=expert_id)
        return result.data if result else None

    def get_all(self) -> list:
        results = self.dao.search(self.col, {})
        return [r.data for r in results]

    def search_by_skill(self, skill: str) -> list:
        results = self.dao.search(self.col, {"skills": {"$regex": skill, "$options": "i"}})
        return [r.data for r in results]

    def search_by_name(self, name: str) -> list:
        results = self.dao.search(self.col, {"name": {"$regex": name, "$options": "i"}})
        return [r.data for r in results]

    # ===== Lấy projects của expert =====

    def get_projects(self, expert_id: str, dao_project) -> list:
        """Lấy tất cả projects mà expert tham gia"""
        participations = dao_project.search("expertParticipate", {"expertID": expert_id})
        project_ids = [p.data.get("projectID") for p in participations]

        projects = []
        for pid in project_ids:
            p = dao_project.get(collection_name="projects", project_id=pid)
            if p:
                projects.append(p.data)
        return projects

    # ===== Lấy documents của expert =====

    def get_documents(self, expert_id: str, dao_doc) -> list:
        results = dao_doc.search("documents", {"createBy": expert_id})
        return [r.data for r in results]
