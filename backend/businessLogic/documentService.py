from databases.interfaceDao.dataDao import DataDAO
from databases.domain.data import Data
import datetime


class DocumentService:

    def __init__(self, dao: DataDAO):
        self.dao = dao
        self.col = "documents"

    # ===== CRUD =====

    def get_by_id(self, doc_id: str) -> dict | None:
        result = self.dao.get(collection_name=self.col, doc_id=doc_id)
        return result.data if result else None

    def get_all(self) -> list:
        results = self.dao.search(self.col, {})
        return [r.data for r in results]

    def get_by_project(self, project_id: str) -> list:
        """Lấy tất cả documents thuộc project (Contain relationship)"""
        results = self.dao.search(self.col, {"contain": project_id})
        return [r.data for r in results]

    def get_by_expert(self, expert_id: str) -> list:
        """Lấy documents do expert upload (uploadBy relationship)"""
        results = self.dao.search(self.col, {"createBy": expert_id})
        return [r.data for r in results]

    # ===== Upload document =====

    def upload(self, expert_id: str, project_id: str,
               name: str, url: str) -> str:
        """Expert upload document vào project"""
        all_docs = self.dao.search(self.col, {})
        next_num = len(all_docs) + 1
        doc_id = f"DOC{str(next_num).zfill(3)}"

        new_doc = Data(
            id=doc_id,
            data={
                "docID":      doc_id,
                "createBy":   expert_id,
                "contain":    project_id,
                "URL":        url,
                "name":       name,
                "CreateDate": datetime.date.today().isoformat()
            }
        )
        self.dao.collections[self.col].insert_one(new_doc.data)
        return doc_id

    def delete(self, doc_id: str, expert_id: str) -> str:
        """Chỉ expert tạo document mới được xoá"""
        doc = self.dao.get(collection_name=self.col, doc_id=doc_id)
        if not doc:
            return "Document không tồn tại"

        if doc.data.get("createBy") != expert_id:
            return "Không có quyền xoá document này"

        return self.dao.delete(self.col, doc)
