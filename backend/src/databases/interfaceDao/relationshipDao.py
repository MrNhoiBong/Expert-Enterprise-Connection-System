from abc import ABC, abstractmethod
from databases.domain.relationship import Relationship
from databases.interfaceDao.baseDao import BaseDAO


class RelationshipDAO(BaseDAO[Relationship, dict]):
    """
    Neo4j DAO.
    T = Relationship
    Q = dict  →  {"relationship": "PARTICIPATE", "from_label": "Expert"}
    """

    @abstractmethod
    def create(self, rel: Relationship) -> str:
        pass