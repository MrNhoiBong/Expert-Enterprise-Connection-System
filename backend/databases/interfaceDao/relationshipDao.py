from abc import ABC, abstractmethod
from databases.domain.relationship import Relationship
from databases.interfaceDao.baseDao import BaseDAO

class RelationshipDAO(ABC):

    @abstractmethod
    def create(self, rel: Relationship) -> str:
        pass

    @abstractmethod
    def find(self, id: str) -> Relationship:
        pass

    @abstractmethod
    def search(self, criteria: dict) -> list:
        pass

    @abstractmethod
    def delete(self, rel: Relationship) -> str:
        pass