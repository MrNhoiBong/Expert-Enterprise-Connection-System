from databases.interfaceDao.dataDao import DataDAO


class EnterpriseService:

    def __init__(self, dao: DataDAO):
        self.dao = dao
        self.col = "enterprises"

    # ===== Lấy thông tin enterprise =====

    def get_by_id(self, enterprise_id: str) -> dict | None:
        result = self.dao.get(collection_name=self.col, enterprise_id=enterprise_id)
        return result.data if result else None

    def get_all(self) -> list:
        results = self.dao.search(self.col, {})
        return [r.data for r in results]

    def search_by_name(self, name: str) -> list:
        results = self.dao.search(self.col, {"company_name": {"$regex": name, "$options": "i"}})
        return [r.data for r in results]

    # ===== Lấy projects của enterprise =====

    def get_participated_projects(self, enterprise_id: str, dao_project) -> list:
        """Projects enterprise đang tham gia"""
        participations = dao_project.search("enterpriseParticipate", {"enterpriseID": enterprise_id})
        project_ids = [p.data.get("projectID") for p in participations]

        projects = []
        for pid in project_ids:
            p = dao_project.get(collection_name="projects", project_id=pid)
            if p:
                projects.append(p.data)
        return projects

    def get_granted_projects(self, enterprise_id: str, dao_grant) -> list:
        """Projects enterprise đã grant (tài trợ)"""
        grants = dao_grant.search("grant", {"enterpriseID": enterprise_id})
        return [g.data for g in grants]

    # ===== Grant project =====

    def grant_project(self, enterprise_id: str, project_id: str,
                      description: str, dao_grant) -> str:
        from databases.domain.data import Data
        import datetime

        existing = dao_grant.get(
            collection_name="grant",
            enterprise_id=enterprise_id,
            project_id=project_id
        )
        if existing:
            return "Enterprise đã grant project này rồi"

        new_grant = Data(
            id=None,
            data={
                "enterpriseID": enterprise_id,
                "projectID":    project_id,
                "status":       "pending",
                "grantDate":    datetime.date.today().isoformat(),
                "description":  description
            }
        )
        dao_grant.collections["grant"].insert_one(new_grant.data)
        return "Grant project thành công"
