from abc import ABC, abstractmethod

class DAOWorker(ABC):

    @abstractmethod
    def handle(self, event: str):
        pass