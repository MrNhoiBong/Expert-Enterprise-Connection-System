import uuid
import json
import socket
import datetime
from io import BytesIO

from minio import Minio
from minio.error import S3Error

from databases.interfaceDao.imageDocDao import ImageDocDAO
from databases.domain.imageDoc import ImageDoc


def get_local_ip() -> str:
    """
    Tự động lấy IP LAN của máy hiện tại.
    Kết nối UDP giả đến 8.8.8.8 để xác định interface mạng đang dùng
    — không thực sự gửi packet nào ra ngoài.
    Fallback về 127.0.0.1 nếu không có mạng.
    """
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class ImageDocDAOImp(ImageDocDAO):

    BUCKET = "imagedocdb"

    def __init__(self,
                 endpoint:    str  = "localhost:9000",
                 access_key:  str  = "minioadmin",
                 secret_key:  str  = "minioadmin123",
                 secure:      bool = False,
                 public_host: str  = None):
        """
        public_host : IP:port mà browser dùng để load ảnh từ MinIO.
                      None → tự động detect IP LAN + lấy port từ endpoint.
                      Ví dụ kết quả: "192.168.1.10:9000"
        """
        self.client = Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )

        if public_host:
            self.public_host = public_host
        else:
            minio_port       = endpoint.split(":")[-1] if ":" in endpoint else "9000"
            detected_ip      = get_local_ip()
            self.public_host = f"{detected_ip}:{minio_port}"

        print(f"✅ MinIO public host: http://{self.public_host}/{self.BUCKET}/")

        self.database_info = "MinIO - File & Image Storage"
        self._ensure_bucket()

    def _ensure_bucket(self):
        if not self.client.bucket_exists(self.BUCKET):
            self.client.make_bucket(self.BUCKET)
            print(f"✅ Tạo bucket: {self.BUCKET}")
        else:
            print(f"✅ Bucket '{self.BUCKET}' đã tồn tại")

        policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect":    "Allow",
                "Principal": {"AWS": ["*"]},
                "Action":    ["s3:GetObject"],
                "Resource":  [f"arn:aws:s3:::{self.BUCKET}/*"]
            }]
        }
        self.client.set_bucket_policy(self.BUCKET, json.dumps(policy))
        print(f"✅ Set public read policy cho bucket: {self.BUCKET}")

    def upload(self, file_data, file_name, content_type, uploaded_by, project_id=""):
        import urllib.parse
        file_id  = str(uuid.uuid4())

        # Encode tên file để dùng trong object path (giữ nguyên để hiển thị)
        safe_name = urllib.parse.quote(file_name, safe='.-_')
        obj_name  = f"{project_id}/{file_id}/{safe_name}" if project_id else f"{file_id}/{safe_name}"

        # MinIO metadata chỉ hỗ trợ ASCII — encode tên file bằng RFC 5987
        def to_ascii(s):
            try:
                s.encode('ascii')
                return s
            except UnicodeEncodeError:
                return urllib.parse.quote(s, safe='')

        try:
            self.client.put_object(
                bucket_name=self.BUCKET,
                object_name=obj_name,
                data=BytesIO(file_data),
                length=len(file_data),
                content_type=content_type,
                metadata={
                    "uploaded_by":   to_ascii(uploaded_by),
                    "project_id":    to_ascii(project_id),
                    "original_name": to_ascii(file_name),   # encode nếu có tiếng Việt
                }
            )
            return ImageDoc(
                id=file_id, link=self.get_presigned_url_by_name(obj_name),
                file_name=file_name,   # giữ tên gốc (có Unicode) trong ImageDoc
                bucket=self.BUCKET, content_type=content_type,
                size=len(file_data), uploaded_by=uploaded_by, project_id=project_id,
                created_at=datetime.datetime.utcnow().isoformat()
            )
        except S3Error as e:
            raise RuntimeError(f"MinIO upload error: {e}")

    def find(self, id):
        try:
            for obj in self.client.list_objects(self.BUCKET, recursive=True):
                if id in obj.object_name:
                    stat = self.client.stat_object(self.BUCKET, obj.object_name)
                    return ImageDoc(
                        id=obj.object_name, link=self.get_presigned_url_by_name(obj.object_name),
                        file_name=obj.object_name.split("/")[-1], bucket=self.BUCKET,
                        content_type=stat.content_type, size=obj.size,
                        uploaded_by=stat.metadata.get("x-amz-meta-uploaded_by", "unknown"),
                        project_id=stat.metadata.get("x-amz-meta-project_id", "unknown"),
                        created_at=obj.last_modified.isoformat() if obj.last_modified else ""
                    )
        except Exception as e:
            print(f"❌ Find error: {e}")
        return None

    def search(self, criteria):
        project_id = criteria.get("project_id")
        uploaded_by = criteria.get("uploaded_by")
        content_type_filter = criteria.get("content_type")
        results = []
        try:
            for obj in self.client.list_objects(self.BUCKET, prefix=f"{project_id}/" if project_id else "", recursive=True):
                try:
                    stat = self.client.stat_object(self.BUCKET, obj.object_name)
                    meta_uploader = stat.metadata.get("x-amz-meta-uploaded_by", "unknown")
                    if uploaded_by and meta_uploader != uploaded_by: continue
                    if content_type_filter and not stat.content_type.startswith(content_type_filter): continue
                    results.append(ImageDoc(
                        id=obj.object_name, link=self.get_presigned_url_by_name(obj.object_name),
                        file_name=obj.object_name.split("/")[-1], bucket=self.BUCKET,
                        content_type=stat.content_type, size=obj.size,
                        uploaded_by=meta_uploader,
                        project_id=stat.metadata.get("x-amz-meta-project_id", "unknown"),
                        created_at=obj.last_modified.isoformat() if obj.last_modified else ""
                    ))
                except Exception: continue
        except Exception as e:
            print(f"❌ Search error: {e}")
        return results

    def delete(self, t):
        try:
            self.client.remove_object(self.BUCKET, t.id)
            return "Delete success"
        except Exception as e:
            return f"Delete failed: {e}"

    def get_presigned_url(self, id, expires_hours=24):
        return self.get_presigned_url_by_name(id)

    def get_presigned_url_by_name(self, obj_name, expires_hours=24):
        return f"http://{self.public_host}/{self.BUCKET}/{obj_name}"

    def update(self, oldT, newT):
        try:
            from minio.commonconfig import CopySource
            old_obj = f"{oldT.project_id}/{oldT.id}/{oldT.file_name}" if oldT.project_id else f"{oldT.id}/{oldT.file_name}"
            new_obj = f"{newT.project_id}/{newT.id}/{newT.file_name}" if newT.project_id else f"{newT.id}/{newT.file_name}"
            self.client.copy_object(
                bucket_name=self.BUCKET, object_name=new_obj,
                source=CopySource(self.BUCKET, old_obj),
                metadata={"uploaded_by": newT.uploaded_by, "project_id": newT.project_id, "original_name": newT.file_name},
                metadata_directive="REPLACE"
            )
            if old_obj != new_obj:
                self.client.remove_object(self.BUCKET, old_obj)
            return "Update success"
        except Exception as e:
            return f"Update failed: {e}"

    def showinfo(self):
        return self.database_info