from ..interface.daoWorker import DAOWorker
from databases.implement.imageDocDaoImp import ImageDocDAOImp


class MinioWorker(DAOWorker):

    def __init__(self, dao: ImageDocDAOImp):
        self.dao = dao

    # ========================
    # can_handle
    # ========================
    def can_handle(self, event: str):
        return event in [
            "show_info",
            "upload",
            "minio_search",   
            "find",
            "delete",
            "get_url",
            "get_all_urls"
        ]

    # ========================
    # handle
    # ========================
    def handle(self, event: str, data: dict = None):
        data = data or {}

        if event == "show_info":
            return self._show_info()

        elif event == "upload":
            return self._upload(data)

        elif event == "find":
            return self._find(data)

        elif event == "minio_search":
            return self._search(data)

        elif event == "delete":
            return self._delete(data)

        elif event == "get_url":
            return self._get_url(data)

        elif event == "get_all_urls":
            return self._get_all_urls(data)

        else:
            return f"❌ MinioWorker không xử lý event: {event}"

    # ========================
    # Handlers
    # ========================
    def _show_info(self):
        info = self.dao.showinfo()
        print(f"  ℹ️  {info}")
        return info

    def _upload(self, data: dict):
        """
        data = {
            "file_data":    bytes,
            "file_name":    str,
            "content_type": str,
            "uploaded_by":  str,
            "project_id":   str   (optional)
        }
        """
        required = ["file_data", "file_name", "content_type", "uploaded_by"]
        for field in required:
            if field not in data:
                return f"❌ Thiếu field: {field}"

        doc = self.dao.upload(
            file_data=data["file_data"],
            file_name=data["file_name"],
            content_type=data["content_type"],
            uploaded_by=data["uploaded_by"],
            project_id=data.get("project_id", "")
        )
        print(f"  ✅ Upload: {doc.file_name} | ID: {doc.id}")
        return doc

    def _find(self, data: dict):
        """
        data = { "id": str }
        """
        if "id" not in data:
            return "❌ Thiếu field: id"

        doc = self.dao.find(data["id"])
        if doc:
            print(f"  ✅ Found: {doc.file_name} | bucket: {doc.bucket}")
        else:
            print(f"  ❌ Không tìm thấy file: {data['id']}")
        return doc

    def _search(self, data: dict):
        results = self.dao.search(data)
        print(f"Tìm thấy: {len(results)} files")
        for r in results:
            size_kb = round(r.size / 1024, 1)
            print(f"     📄 {r.file_name:<20} | {r.content_type:<25} | {size_kb} KB | by: {r.uploaded_by}")
        return results

    def _delete(self, data: dict):
        """
        data = { "id": str }
        """
        if "id" not in data:
            return "Thiếu field: id"

        doc = self.dao.find(data["id"])
        if not doc:
            return f"Không tìm thấy file: {data['id']}"

        msg = self.dao.delete(doc)
        print(f"Delete: {msg}")
        return msg

    def _get_url(self, data: dict):
        """
        data = {
            "id":           str,
            "expires_hours": int  (optional, default 24)
        }
        """
        if "id" not in data:
            return "❌ Thiếu field: id"

        url = self.dao.get_presigned_url(
            id=data["id"],
            expires_hours=data.get("expires_hours", 24)
        )
        if url:
            print(f"  ✅ URL: {url[:60]}...")
        else:
            print(f"  ❌ Không tạo được URL cho: {data['id']}")
        return url

    def _get_all_urls(self, data: dict):
        """
        data = {
            "content_type":  str  (optional) — "image/" | "application/"
            "expires_hours": int  (optional, default 24)
        }
        """
        criteria = {}
        if "content_type" in data:
            criteria["content_type"] = data["content_type"]

        results  = self.dao.search(criteria)
        expires  = data.get("expires_hours", 24)
        url_list = []

        print(f"  ✅ Tạo URL cho {len(results)} files (hết hạn sau {expires}h):")
        for r in results:
            url     = self.dao.get_presigned_url_by_name(r.id, expires_hours=expires)
            size_kb = round(r.size / 1024, 1)
            print(f"  📄 {r.file_name:<20} | {size_kb} KB")
            print(f"     🔗 {url}")
            print()
            url_list.append({"file_name": r.file_name, "url": url, "size_kb": size_kb})

        return url_list