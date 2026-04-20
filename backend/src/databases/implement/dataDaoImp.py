from bson import ObjectId
from databases.interfaceDao.dataDao import DataDAO
from databases.domain.data import Data


class DataDAOImp(DataDAO):

    def __init__(self, db):
        self.db = db
        self.collections = {name: db[name] for name in db.list_collection_names()}
        self.database_info = "MongoDB - Information Storage"

    def show_collections(self):
        for name, col in self.collections.items():
            print(f"  - {name}: {col.count_documents({})} documents")
        return list(self.collections.keys())

    def _get_collection(self, name: str):
        # Tự thêm collection mới nếu chưa có (MongoDB tạo lazy)
        if name not in self.collections:
            self.collections[name] = self.db[name]
        return self.collections[name]

    def _clean_doc(self, doc: dict) -> dict:
        """Convert ObjectId → str để FastAPI có thể serialize JSON"""
        if doc is None:
            return None
        clean = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                clean[k] = str(v)
            elif isinstance(v, dict):
                clean[k] = self._clean_doc(v)        # nested dict
            elif isinstance(v, list):
                clean[k] = [
                    str(i) if isinstance(i, ObjectId)
                    else self._clean_doc(i) if isinstance(i, dict)
                    else i
                    for i in v
                ]
            else:
                clean[k] = v
        return clean

    # ===== BaseDAO methods =====

    def find(self, collection_name: str, id: int) -> Data:
        col = self._get_collection(collection_name)
        result = col.find_one({"_id": id})
        if result:
            result = self._clean_doc(result)         # ✅
            return Data(id=result["_id"], data=result)
        return None

    def search(self, collection_name: str, criteria: dict) -> list:
        col = self._get_collection(collection_name)
        data_list = []
        for r in col.find(criteria):
            r = self._clean_doc(r)                   # ✅
            data_list.append(Data(id=r["_id"], data=r))
        return data_list

    def update(self, collection_name: str, oldT: Data, newT: Data) -> str:
        col = self._get_collection(collection_name)
        result = col.update_one(
            {"_id": oldT.id},
            {"$set": newT.data}
        )
        if result.modified_count > 0:
            return "Update success"
        return "Update failed"

    def delete(self, collection_name: str, t: Data) -> str:
        col = self._get_collection(collection_name)
        result = col.delete_one({"_id": t.id})
        if result.deleted_count > 0:
            return "Delete success"
        return "Delete failed"

    # ===== DataDAO method =====

    def get(
        self,
        collection_name: str,
        expert_id: str = None,
        enterprise_id: str = None,
        project_id: str = None,
        found_id: str = None,
        doc_id: str = None
    ) -> Data:
        col = self._get_collection(collection_name)

        query = {}
        if expert_id:
            query["expertID"] = expert_id
        if enterprise_id:
            query["enterpriseID"] = enterprise_id
        if project_id:
            query["projectID"] = project_id
        if found_id:
            query["FoundID"] = found_id
        if doc_id:
            query["docID"] = doc_id

        result = col.find_one(query)
        if result:
            result = self._clean_doc(result)         # ✅
            return Data(id=result["_id"], data=result)
        return None

    # ===== Extra operation =====

    def get_expert_skills(self, expert_id: str) -> list:
        """Lấy danh sách skills của expert theo expertID"""
        col  = self._get_collection("experts")
        doc  = col.find_one({"expertID": expert_id}, {"skills": 1, "_id": 0})
        if doc and isinstance(doc.get("skills"), list):
            return doc["skills"]
        return []

    def showinfo(self) -> str:
        return self.database_info