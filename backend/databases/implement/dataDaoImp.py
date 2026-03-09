from databases.interfaceDao.dataDao import DataDAO
from databases.domain.data import Data


class DataDAOImp(DataDAO):

    def __init__(self, collection):
        self.collection = collection
        self.database_info = "MongoDB - Information Storage"

    # ===== BaseDAO methods =====

    def find(self, id: int) -> Data:
        result = self.collection.find_one({"_id": id})

        if result:
            return Data(id=result["_id"], data=result)

        return None


    def search(self, criteria) -> list:
        results = self.collection.find(criteria)

        data_list = []

        for r in results:
            data_list.append(
                Data(id=r["_id"], data=r)
            )

        return data_list


    def update(self, oldT: Data, newT: Data) -> str:
        result = self.collection.update_one(
            {"_id": oldT.id},
            {"$set": newT.data}
        )

        if result.modified_count > 0:
            return "Update success"

        return "Update failed"


    def delete(self, t: Data) -> str:
        result = self.collection.delete_one(
            {"_id": t.id}
        )

        if result.deleted_count > 0:
            return "Delete success"

        return "Delete failed"


    # ===== DataDAO method =====

    def get(
        self,
        expert_id: str = None,
        enterprise_id: str = None,
        project_id: str = None,
        found_id: str = None,
        doc_id: str = None
    ) -> Data:

        query = {}

        if expert_id:
            query["expertID"] = expert_id

        if enterprise_id:
            query["enterpriseID"] = enterprise_id

        if project_id:
            query["projectID"] = project_id

        if found_id:
            query["foundID"] = found_id

        if doc_id:
            query["docID"] = doc_id

        result = self.collection.find_one(query)

        if result:
            return Data(id=result["_id"], data=result)

        return None


    # ===== Extra operation =====

    def showinfo(self) -> str:
        return self.database_info