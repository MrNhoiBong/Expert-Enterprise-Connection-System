from abc import ABC, abstractmethod
from .baseDao import BaseDAO
from databases.domain.data import Data

class DataDAO(BaseDAO[Data, dict]):
    """
    MongoDB DAO.
    T = Data
    Q = dict  →  {"collection_name": "experts", "expertID": "EXP001"}
    """

    @abstractmethod
    def get(self,
            collection_name: str,
            expert_id:       str = None,
            enterprise_id:   str = None,
            project_id:      str = None,
            found_id:        str = None,
            doc_id:          str = None) -> Data:
        pass

    @abstractmethod
    def show_collections(self) -> list:
        pass

