from abc import ABC, abstractmethod
from typing import List, TypeVar

T = TypeVar('T')


class BaseDAO(ABC):

    @abstractmethod
    def find(self, id: int) -> T:
        pass

    @abstractmethod
    def search(self, criteria) -> List[T]:
        pass

    @abstractmethod
    def update(self, oldT: T, newT: T) -> str:
        pass

    @abstractmethod
    def delete(self, t: T) -> str:
        pass