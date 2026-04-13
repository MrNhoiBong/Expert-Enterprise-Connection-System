from abc import ABC, abstractmethod


class GetUser(ABC):

    @abstractmethod
    def getuser(self, Acc: str, Pwd: str):
        pass