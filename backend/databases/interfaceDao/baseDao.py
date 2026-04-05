from abc import ABC, abstractmethod
from typing import List, TypeVar

T = TypeVar('T')


class BaseDAO(ABC):

    @abstractmethod
    def find(self, collection_name: str, id: int):
        pass

    @abstractmethod
    def search(self, collection_name: str, criteria: dict) -> list:
        pass

    @abstractmethod
    def update(self, collection_name: str, oldT, newT) -> str:
        pass

    @abstractmethod
    def delete(self, collection_name: str, t) -> str:
        pass