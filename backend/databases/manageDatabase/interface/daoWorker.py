from abc import ABC, abstractmethod


class DAOWorker(ABC):

    @abstractmethod
    def can_handle(self, event: str):
        pass

    @abstractmethod
    def handle(self, event: str, data: dict = None):
        pass