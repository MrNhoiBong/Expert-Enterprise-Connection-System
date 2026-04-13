from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List

T = TypeVar('T')   # kiểu dữ liệu domain
Q = TypeVar('Q')   # kiểu query


class BaseDAO(ABC, Generic[T, Q]):
    """
    Base interface cho tất cả DAO.
    T = domain object  (Data, Relationship, ImageDoc)
    Q = query type     (dict cho MongoDB/MinIO, str cho Neo4j)
    """

    @abstractmethod
    def find(self, query: Q) -> T:
        """Tìm 1 object theo query"""
        pass

    @abstractmethod
    def search(self, criteria: Q) -> List[T]:
        """Tìm nhiều objects theo criteria"""
        pass

    @abstractmethod
    def update(self, oldT: T, newT: T) -> str:
        """Cập nhật object"""
        pass

    @abstractmethod
    def delete(self, t: T) -> str:
        """Xoá object"""
        pass

    @abstractmethod
    def showinfo(self) -> str:
        """Thông tin database"""
        pass