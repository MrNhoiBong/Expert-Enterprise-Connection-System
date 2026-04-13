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
from databases.implement.imageDocDaoImp import ImageDocDAOImp



class ServiceFactory:
    """
    Khởi tạo và inject toàn bộ services.
    Dùng ở main.py hoặc API layer.
    """

    def __init__(self,
                 mongo_uri:        str  = "mongodb://admin:admin123@localhost:27017/",
                 db_name:          str  = "mydb",
                 minio_endpoint:   str  = "localhost:9000",
                 minio_access_key: str  = "minioadmin",            
                 minio_secret_key: str  = "minioadmin123",         
                 minio_secure:     bool = False):                  
        # MongoDB setup
        client = MongoClient(mongo_uri)
        self.db = client[db_name]
        self.dao = DataDAOImp(self.db)

        # MinIO setup
        self.image_dao = ImageDocDAOImp(
            endpoint=minio_endpoint,
            access_key=minio_access_key,
            secret_key=minio_secret_key,
            secure=minio_secure
        )

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
