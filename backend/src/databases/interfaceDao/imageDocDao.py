# imageDocDAO.py
from abc import ABC, abstractmethod
from databases.domain.imageDoc import ImageDoc
from databases.interfaceDao.baseDao import BaseDAO

class ImageDocDAO(BaseDAO[ImageDoc, dict]):
    """
    MinIO DAO.
    T = ImageDoc
    Q = dict  →  {"project_id": "PRJ001", "uploaded_by": "EXP001"}
    """

    @abstractmethod
    def upload(self,
               file_data:    bytes,
               file_name:    str,
               content_type: str,
               uploaded_by:  str,
               project_id:   str) -> ImageDoc:
        pass

    @abstractmethod
    def get_presigned_url(self, id: str, expires_hours: int) -> str:
        pass