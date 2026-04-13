class ImageDoc:

    def __init__(self,
                 id: str,
                 link: str,
                 file_name: str = "",
                 bucket: str = "",
                 content_type: str = "",
                 size: int = 0,
                 uploaded_by: str = "",
                 project_id: str = "",
                 created_at: str = ""):

        self.id           = id             # unique ID (uuid hoặc docID)
        self.link         = link           # URL truy cập file (presigned URL)
        self.file_name    = file_name      # tên file gốc
        self.bucket       = bucket         # bucket chứa file
        self.content_type = content_type   # image/png, application/pdf, ...
        self.size         = size           # bytes
        self.uploaded_by  = uploaded_by    # expertID
        self.project_id   = project_id     # projectID
        self.created_at   = created_at

    def to_dict(self) -> dict:
        return {
            "id":           self.id,
            "link":         self.link,
            "file_name":    self.file_name,
            "bucket":       self.bucket,
            "content_type": self.content_type,
            "size":         self.size,
            "uploaded_by":  self.uploaded_by,
            "project_id":   self.project_id,
            "created_at":   self.created_at
        }
