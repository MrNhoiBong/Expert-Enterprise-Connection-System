from abc import ABC, abstractmethod


class AuthManage(ABC):

    @abstractmethod
    def login(self, acc: str, pwd: str) -> dict:
        pass

    @abstractmethod
    def logout(self, session: str) -> str:
        pass
