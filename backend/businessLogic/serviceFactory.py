from pymongo import MongoClient

from databases.implement.dataDaoImp import DataDAOImp

from businessLogic.expertService import ExpertService
from businessLogic.enterpriseService import EnterpriseService
from businessLogic.projectService import ProjectService
from businessLogic.documentService import DocumentService
from businessLogic.foundationService import FoundationService

from permission.implement.getUserImp import GetUserImpl          
from permission.implement.sessionManageImp import SessionManageImpl
from permission.implement.authManageImp import AuthManageImpl


class ServiceFactory:
    """
    Khởi tạo và inject toàn bộ services.
    Dùng ở main.py hoặc API layer.
    """

    def __init__(self,
                 mongo_uri: str = "mongodb://admin:admin123@localhost:27017/",
                 db_name: str = "mydb"):

        client = MongoClient(mongo_uri)
        self.db = client[db_name]
        self.dao = DataDAOImp(self.db)

        # Business services
        self.expert      = ExpertService(self.dao)
        self.enterprise  = EnterpriseService(self.dao)
        self.project     = ProjectService(self.dao)
        self.document    = DocumentService(self.dao)
        self.foundation  = FoundationService(self.dao)


        # Permission services
        getuser_svc      = GetUserImpl(self.db)
        session_svc      = SessionManageImpl()
        self.auth        = AuthManageImpl(getuser_svc, session_svc)
