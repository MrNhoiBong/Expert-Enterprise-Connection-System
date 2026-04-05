from databases.interfaceDao.dataDao import DataDAO
from databases.domain.data import Data
import datetime


class ProjectService:

    def __init__(self, dao: DataDAO):
        self.dao = dao
        self.col = "projects"

    # ===== CRUD =====

    def get_by_id(self, project_id: str) -> dict | None:
        result = self.dao.get(collection_name=self.col, project_id=project_id)
        return result.data if result else None

    def get_all(self) -> list:
        results = self.dao.search(self.col, {})
        return [r.data for r in results]

    def get_by_status(self, status: str) -> list:
        results = self.dao.search(self.col, {"status": status})
        return [r.data for r in results]

    def create(self, expert_id: str, name: str, description: str,
               start_date: str, end_date: str) -> str:
        """Expert tạo project mới"""
        # Sinh projectID mới
        all_projects = self.dao.search(self.col, {})
        next_num = len(all_projects) + 1
        project_id = f"PRJ{str(next_num).zfill(3)}"

        new_project = Data(
            id=project_id,
            data={
                "projectID":       project_id,
                "createBy":        expert_id,
                "createDate":      datetime.date.today().isoformat(),
                "name":            name,
                "status":          "Planning",
                "projectTimeline": {
                    "start_date": start_date,
                    "end_date":   end_date
                },
                "description": description
            }
        )
        self.dao.collections[self.col].insert_one(new_project.data)
        return project_id

    def update_status(self, project_id: str, new_status: str) -> str:
        valid_statuses = ["Planning", "In Progress", "Completed", "Cancelled"]
        if new_status not in valid_statuses:
            return f"Status không hợp lệ. Chọn: {valid_statuses}"

        old = self.dao.get(collection_name=self.col, project_id=project_id)
        if not old:
            return "Project không tồn tại"

        new_data = Data(id=project_id, data={"status": new_status})
        return self.dao.update(self.col, old, new_data)

    # ===== Expert tham gia project =====

    def add_expert(self, project_id: str, expert_id: str,
                   role: str, dao_participate) -> str:
        existing = dao_participate.get(
            collection_name="expertParticipate",
            expert_id=expert_id,
            project_id=project_id
        )
        if existing:
            return "Expert đã tham gia project này rồi"

        entry = Data(
            id=None,
            data={
                "expertID":  expert_id,
                "projectID": project_id,
                "role":      role,
                "joinDate":  datetime.date.today().isoformat(),
                "status":    "active"
            }
        )
        dao_participate.collections["expertParticipate"].insert_one(entry.data)
        return "Thêm expert thành công"

    def remove_expert(self, project_id: str, expert_id: str,
                      dao_participate) -> str:
        existing = dao_participate.get(
            collection_name="expertParticipate",
            expert_id=expert_id,
            project_id=project_id
        )
        if not existing:
            return "Expert không tham gia project này"

        return dao_participate.delete("expertParticipate", existing)

    # ===== Lấy danh sách experts/enterprises trong project =====

    def get_experts(self, project_id: str, dao_participate) -> list:
        results = dao_participate.search("expertParticipate", {"projectID": project_id})
        return [r.data for r in results]

    def get_enterprises(self, project_id: str, dao_participate) -> list:
        results = dao_participate.search("enterpriseParticipate", {"projectID": project_id})
        return [r.data for r in results]

    # ===== Lấy documents của project =====

    def get_documents(self, project_id: str, dao_doc) -> list:
        results = dao_doc.search("documents", {"contain": project_id})
        return [r.data for r in results]

    # ===== Funding =====

    def get_funding(self, project_id: str) -> dict | None:
        result = self.dao.get(collection_name=self.col, project_id=project_id)
        if result and result.data.get("FoundID"):
            return {"FoundID": result.data["FoundID"]}
        return None

    def assign_funding(self, project_id: str, found_id: str) -> str:
        old = self.dao.get(collection_name=self.col, project_id=project_id)
        if not old:
            return "Project không tồn tại"

        new_data = Data(id=project_id, data={"FoundID": found_id})
        return self.dao.update(self.col, old, new_data)
