from databases.interfaceDao.dataDao import DataDAO
from databases.domain.data import Data
import datetime


class FoundationService:

    def __init__(self, dao: DataDAO):
        self.dao = dao
        self.col_foundation = "foundation"
        self.col_funding    = "createFund"

    # ===== Foundation =====

    def get_foundation_by_id(self, found_id: str) -> dict | None:
        result = self.dao.get(collection_name=self.col_foundation, found_id=found_id)
        return result.data if result else None

    def get_all_foundations(self) -> list:
        results = self.dao.search(self.col_foundation, {})
        return [r.data for r in results]

    # ===== Funding =====

    def get_funding_by_id(self, found_id: str) -> dict | None:
        result = self.dao.get(collection_name=self.col_funding, found_id=found_id)
        return result.data if result else None

    def get_all_fundings(self) -> list:
        results = self.dao.search(self.col_funding, {})
        return [r.data for r in results]

    def get_fundings_by_foundation(self, found_id: str) -> list:
        """Lấy tất cả quỹ do foundation tạo (CREATE_FUND)"""
        results = self.dao.search(self.col_funding, {"FoundID": found_id})
        return [r.data for r in results]

    # ===== Create Fund =====

    def create_fund(self, found_id: str, fund_name: str,
                    founder: str) -> str:
        """Foundation tạo quỹ mới"""
        existing = self.dao.get(collection_name=self.col_foundation, found_id=found_id)
        if not existing:
            return "Foundation không tồn tại"

        new_fund = Data(
            id=found_id,
            data={
                "FoundID":  found_id,
                "fundName": fund_name,
                "date":     datetime.date.today().isoformat(),
                "founder":  founder,
            }
        )
        self.dao.collections[self.col_funding].insert_one(new_fund.data)
        return f"Tạo quỹ '{fund_name}' thành công"

    # ===== Lấy projects được fund (CALL_FUND) =====

    def get_funded_projects(self, found_id: str, dao_project) -> list:
        """Lấy tất cả projects đang dùng quỹ này"""
        results = dao_project.search("projects", {"FoundID": found_id})
        return [r.data for r in results]
