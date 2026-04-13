from abc import ABC, abstractmethod
from permission.interface.getUser import GetUser


class SessionManage(ABC):

    @abstractmethod
    def createsession(self, userId: str) -> str:
        pass

    @abstractmethod
    def checksession(self, session: str) -> str:
        pass
