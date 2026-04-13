import uuid
import json
import datetime
from io import BytesIO

from minio import Minio
from minio.error import S3Error

from databases.interfaceDao.imageDocDao import ImageDocDAO
from databases.domain.imageDoc import ImageDoc


class ImageDocDAOImp(ImageDocDAO):

    BUCKET = "imagedocdb"

    def __init__(self,
                 endpoint:    str  = "localhost:9000",
                 access_key:  str  = "minioadmin",
                 secret_key:  str  = "minioadmin123",
                 secure:      bool = False,
                 public_host: str  = "192.168.80.48:9000"):

        self.client      = Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )
        self.public_host   = public_host or endpoint
        self.database_info = "MinIO - File & Image Storage"
        self._ensure_bucket()

    # ========================
    # Setup bucket + public policy
    # ========================
    def _ensure_bucket(self):
        if not self.client.bucket_exists(self.BUCKET):
            self.client.make_bucket(self.BUCKET)
            print(f"✅ Tạo bucket: {self.BUCKET}")
        else:
            print(f"✅ Bucket '{self.BUCKET}' đã tồn tại")

        # ✅ Tự động set public read mỗi lần khởi động
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect":    "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action":    ["s3:GetObject"],
                    "Resource":  [f"arn:aws:s3:::{self.BUCKET}/*"]
                }
            ]
        }
        self.client.set_bucket_policy(self.BUCKET, json.dumps(policy))
        print(f"✅ Set public read policy cho bucket: {self.BUCKET}")

    # ========================
    # Upload file
    # ========================
    def upload(self,
               file_data:    bytes,
               file_name:    str,
               content_type: str,
               uploaded_by:  str,
               project_id:   str = "") -> ImageDoc:

        file_id  = str(uuid.uuid4())
        obj_name = f"{project_id}/{file_id}/{file_name}" if project_id else f"{file_id}/{file_name}"

        try:
            self.client.put_object(
                bucket_name=self.BUCKET,
                object_name=obj_name,
                data=BytesIO(file_data),
                length=len(file_data),
                content_type=content_type,
                metadata={
                    "uploaded_by":   uploaded_by,
                    "project_id":    project_id,
                    "original_name": file_name
                }
            )

            link = self.get_presigned_url_by_name(obj_name)

            return ImageDoc(
                id=file_id,
                link=link,
                file_name=file_name,
                bucket=self.BUCKET,
                content_type=content_type,
                size=len(file_data),
                uploaded_by=uploaded_by,
                project_id=project_id,
                created_at=datetime.datetime.utcnow().isoformat()
            )

        except S3Error as e:
            raise RuntimeError(f"MinIO upload error: {e}")

    # ========================
    # Find
    # ========================
    def find(self, id: str) -> ImageDoc | None:
        try:
            objects = self.client.list_objects(self.BUCKET, recursive=True)
            for obj in objects:
                if obj.object_name == id or obj.object_name.endswith(f"/{id}") or id in obj.object_name:
                    stat = self.client.stat_object(self.BUCKET, obj.object_name)
                    link = self.get_presigned_url_by_name(obj.object_name)

                    return ImageDoc(
                        id=obj.object_name,
                        link=link,
                        file_name=obj.object_name.split("/")[-1],
                        bucket=self.BUCKET,
                        content_type=stat.content_type,
                        size=obj.size,
                        uploaded_by=stat.metadata.get("x-amz-meta-uploaded_by", "unknown"),
                        project_id=stat.metadata.get("x-amz-meta-project_id", "unknown"),
                        created_at=obj.last_modified.isoformat() if obj.last_modified else ""
                    )
        except Exception as e:
            print(f"❌ Find error: {e}")
        return None

    # ========================
    # Search by criteria
    # ========================
    def search(self, criteria: dict) -> list:
        project_id          = criteria.get("project_id")
        uploaded_by         = criteria.get("uploaded_by")
        content_type_filter = criteria.get("content_type")

        results = []
        prefix  = f"{project_id}/" if project_id else ""

        try:
            objects = self.client.list_objects(self.BUCKET, prefix=prefix, recursive=True)

            for obj in objects:
                try:
                    stat          = self.client.stat_object(self.BUCKET, obj.object_name)
                    meta_uploader = stat.metadata.get("x-amz-meta-uploaded_by", "unknown")
                    meta_project  = stat.metadata.get("x-amz-meta-project_id", "unknown")

                    if uploaded_by and meta_uploader != uploaded_by:
                        continue
                    if content_type_filter and not stat.content_type.startswith(content_type_filter):
                        continue

                    link = self.get_presigned_url_by_name(obj.object_name)

                    results.append(ImageDoc(
                        id=obj.object_name,
                        link=link,
                        file_name=obj.object_name.split("/")[-1],
                        bucket=self.BUCKET,
                        content_type=stat.content_type,
                        size=obj.size,
                        uploaded_by=meta_uploader,
                        project_id=meta_project,
                        created_at=obj.last_modified.isoformat() if obj.last_modified else ""
                    ))
                except Exception:
                    continue

        except Exception as e:
            print(f"❌ Search error: {e}")

        return results

    # ========================
    # Delete file
    # ========================
    def delete(self, t: ImageDoc) -> str:
        try:
            self.client.remove_object(self.BUCKET, t.id)
            return "Delete success"
        except Exception as e:
            return f"Delete failed: {e}"

    # ========================
    # URL → Direct URL vì bucket public
    # ========================
    def get_presigned_url(self, id: str, expires_hours: int = 24) -> str:
        return self.get_presigned_url_by_name(id)

    def get_presigned_url_by_name(self, obj_name: str, expires_hours: int = 24) -> str:
        # ✅ Bucket public → direct URL, không cần chữ ký
        return f"http://{self.public_host}/{self.BUCKET}/{obj_name}"

    # ========================
    # Update
    # ========================
    def update(self, oldT: ImageDoc, newT: ImageDoc) -> str:
        try:
            from minio.commonconfig import CopySource

            old_obj = f"{oldT.project_id}/{oldT.id}/{oldT.file_name}" if oldT.project_id else f"{oldT.id}/{oldT.file_name}"
            new_obj = f"{newT.project_id}/{newT.id}/{newT.file_name}" if newT.project_id else f"{newT.id}/{newT.file_name}"

            self.client.copy_object(
                bucket_name=self.BUCKET,
                object_name=new_obj,
                source=CopySource(self.BUCKET, old_obj),
                metadata={
                    "uploaded_by":   newT.uploaded_by,
                    "project_id":    newT.project_id,
                    "original_name": newT.file_name
                },
                metadata_directive="REPLACE"
            )

            if old_obj != new_obj:
                self.client.remove_object(self.BUCKET, old_obj)

            return "Update success"

        except Exception as e:
            return f"Update failed: {e}"

    # ========================
    # Extra
    # ========================
    def showinfo(self) -> str:
        return self.database_info