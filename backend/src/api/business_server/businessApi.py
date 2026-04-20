from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from api.deps import get_factory, get_current_user
from businessLogic.serviceFactory import ServiceFactory
import datetime

router = APIRouter(prefix="/api/v1", tags=["Business"])


# ===== Schemas =====

class ContactRequest(BaseModel):
    message: str

class InvitationRequest(BaseModel):
    user_id:  str        # expertID hoặc enterpriseID được mời
    role:     str        # role trong project
    message:  str = ""

class FileUploadRequest(BaseModel):
    name:       str
    url:        str
    project_id: str

class AcceptCallFundRequest(BaseModel):
    project_id: str      # project gọi fund


# ===== CONTACT =====

@router.post("/experts/{id}/contacts", status_code=201)
def contact_expert(id: str,
                   body: ContactRequest,
                   current_user: dict = Depends(get_current_user),
                   factory: ServiceFactory = Depends(get_factory)):
    expert = factory.expert.get_by_id(id)
    if not expert:
        raise HTTPException(404, "Expert không tồn tại")

    _save_contact(factory, sender=current_user, receiver_id=id,
                  receiver_type="expert", message=body.message)

    return {"message": f"Đã gửi liên hệ tới expert {id}"}


@router.post("/enterprises/{id}/contacts", status_code=201)
def contact_enterprise(id: str,
                       body: ContactRequest,
                       current_user: dict = Depends(get_current_user),
                       factory: ServiceFactory = Depends(get_factory)):
    enterprise = factory.enterprise.get_by_id(id)
    if not enterprise:
        raise HTTPException(404, "Enterprise không tồn tại")

    _save_contact(factory, sender=current_user, receiver_id=id,
                  receiver_type="enterprise", message=body.message)

    return {"message": f"Đã gửi liên hệ tới enterprise {id}"}


def _save_contact(factory, sender: dict, receiver_id: str,
                  receiver_type: str, message: str):
    """Lưu contact request vào MongoDB"""
    import uuid
    col = factory.dao._get_collection("contacts")
    # Kiểm tra đã có pending/accepted request chưa
    existing = col.find_one({
        "senderID": sender["userId"],
        "receiverID": receiver_id,
        "status": {"$in": ["pending", "accepted"]}
    })
    if existing:
        return  # không tạo duplicate
    col.insert_one({
        "contactID":    str(uuid.uuid4())[:8],
        "senderID":     sender["userId"],
        "senderRole":   sender["role"],
        "receiverID":   receiver_id,
        "receiverType": receiver_type,
        "message":      message,
        "status":       "pending",
        "createdAt":    datetime.datetime.utcnow().isoformat()
    })


# ===== INVITATIONS =====

@router.get("/invitations")
def get_invitations(current_user: dict = Depends(get_current_user),
                    factory: ServiceFactory = Depends(get_factory)):
    """Lấy tất cả invitations của user hiện tại (được mời hoặc đã mời)"""
    col = factory.dao._get_collection("invitations")
    uid = current_user["userId"]
    docs = list(col.find({
        "$or": [{"invitedUser": uid}, {"invitedBy": uid}]
    }))
    for d in docs:
        d.pop("_id", None)
    print(f"[DEBUG] GET /invitations uid={uid} → {len(docs)} records")
    return docs


@router.post("/projects/{id}/invitations", status_code=201)
def invite_to_project(id: str,
                      body: InvitationRequest,
                      current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):
    # Kiểm tra project tồn tại
    project = factory.project.get_by_id(id)
    if not project:
        raise HTTPException(404, "Project không tồn tại")

    # Chỉ expert tạo project mới được mời
    if project.get("createBy") != current_user["userId"]:
        raise HTTPException(403, "Chỉ người tạo project mới có thể mời")

    # Lưu invitation
    col = factory.dao._get_collection("invitations")
    count = col.count_documents({})
    inv_id = f"INV{str(count + 1).zfill(4)}"

    col.insert_one({
        "invitationID": inv_id,
        "projectID":    id,
        "invitedBy":    current_user["userId"],
        "invitedUser":  body.user_id,
        "role":         body.role,
        "message":      body.message,
        "status":       "pending",
        "createdAt":    datetime.datetime.utcnow().isoformat()
    })

    return {"message": "Đã gửi lời mời", "invitationID": inv_id}


@router.post("/invitations/{id}/accept")
def accept_invitation(id: str,
                      current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):
    inv = factory.dao._get_collection("invitations").find_one({"invitationID": id})
    if not inv:
        raise HTTPException(404, "Invitation không tồn tại")

    if inv["invitedUser"] != current_user["userId"]:
        raise HTTPException(403, "Bạn không phải người được mời")

    if inv["status"] != "pending":
        raise HTTPException(400, f"Invitation đã ở trạng thái: {inv['status']}")

    # Thêm vào project
    role = current_user["role"]
    if role == "expert":
        msg = factory.project.add_expert(
            project_id=inv["projectID"],
            expert_id=current_user["userId"],
            role=inv["role"],
            dao_participate=factory.dao
        )
    elif role == "enterprise":
        factory.dao._get_collection("enterpriseParticipate").insert_one({
            "enterpriseID": current_user["userId"],
            "projectID":    inv["projectID"],
            "role":         inv["role"],
            "joinDate":     datetime.date.today().isoformat(),
            "status":       "active"
        })
        msg = "Enterprise đã tham gia project"
    else:
        raise HTTPException(403, "Role không hợp lệ")

    # Cập nhật status invitation
    factory.dao._get_collection("invitations").update_one(
        {"invitationID": id},
        {"$set": {"status": "accepted"}}
    )

    return {"message": msg}


@router.post("/invitations/{id}/reject")
def reject_invitation(id: str,
                      current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):
    inv = factory.dao._get_collection("invitations").find_one({"invitationID": id})
    if not inv:
        raise HTTPException(404, "Invitation không tồn tại")

    if inv["invitedUser"] != current_user["userId"]:
        raise HTTPException(403, "Bạn không phải người được mời")

    if inv["status"] != "pending":
        raise HTTPException(400, f"Invitation đã ở trạng thái: {inv['status']}")

    factory.dao._get_collection("invitations").update_one(
        {"invitationID": id},
        {"$set": {"status": "rejected"}}
    )

    return {"message": "Đã từ chối lời mời"}


# ===== FILE UPLOAD =====

@router.post("/files/upload", status_code=201)
async def upload_file(
    file:         UploadFile  = File(...),
    project_id:   str         = Form(...),
    current_user: dict        = Depends(get_current_user),
    factory:      ServiceFactory = Depends(get_factory)
):
    """Upload file lên MinIO và lưu metadata — owner và expert member đều có quyền"""
    project = factory.project.get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project không tồn tại")

    uid = current_user["userId"]

    # Chỉ expert (owner hoặc expert member được invite) mới upload được
    if current_user["role"] not in ("expert",):
        raise HTTPException(403, "Chỉ Expert mới có thể upload file")

    is_owner = project.get("createBy") == uid
    is_member = bool(factory.dao.search(
        "expertParticipate",
        {"expertID": uid, "projectID": project_id}
    ))

    if not is_owner and not is_member:
        raise HTTPException(403, "Bạn không tham gia project này")

    file_data = await file.read()
    image_doc = factory.image_dao.upload(
        file_data=file_data,
        file_name=file.filename,
        content_type=file.content_type,
        uploaded_by=uid,
        project_id=project_id
    )

    doc_id = factory.document.upload(
        expert_id=uid,      # tên param cũ, thực tế là uploadedBy
        project_id=project_id,
        name=file.filename,
        url=image_doc.link
    )

    return {
        "message":   "Upload thành công",
        "docID":     doc_id,
        "fileID":    image_doc.id,
        "url":       image_doc.link,
        "file_name": file.filename,
        "size_kb":   round(image_doc.size / 1024, 1)
    }


# ===== IMAGE UPLOAD (avatar / standalone) =====

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE      = 5 * 1024 * 1024   # 5 MB

@router.post("/image/upload", status_code=201)
async def upload_image(
    file:         UploadFile  = File(...),
    current_user: dict        = Depends(get_current_user),
    factory:      ServiceFactory = Depends(get_factory)
):
    """
    Upload ảnh lên MinIO — không cần project_id.
    Dùng cho avatar profile và ảnh đơn lẻ.

    Request  : multipart/form-data  { file: <image> }
    Response : { message, url, fileID, file_name, size_kb }
    """

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            400,
            f"Chỉ chấp nhận ảnh (JPEG, PNG, GIF, WebP). Nhận được: {file.content_type}"
        )

    file_data = await file.read()

    if len(file_data) > MAX_IMAGE_SIZE:
        raise HTTPException(400, "Ảnh quá lớn — tối đa 5 MB.")

    image_doc = factory.image_dao.upload(
        file_data=file_data,
        file_name=file.filename,
        content_type=file.content_type,
        uploaded_by=current_user["userId"],
        project_id=""   # không gắn vào project
    )

    return {
        "message":   "Upload ảnh thành công",
        "url":       image_doc.link,
        "fileID":    image_doc.id,
        "file_name": image_doc.file_name,
        "size_kb":   round(image_doc.size / 1024, 1)
    }


# ===== CALL FUND - ACCEPT =====

@router.post("/projects/{projectId}/calls/accept")
def accept_call_fund(projectId: str,
                     current_user: dict = Depends(get_current_user),
                     factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] not in ("foundation", "funding"):
        raise HTTPException(403, "Chỉ Foundation mới có thể accept fund call")

    uid = current_user["userId"]
    col = factory.dao._get_collection("fundRequests")

    # Tìm pending request của foundation này cho project này
    req = col.find_one({
        "projectID": projectId,
        "foundID":   uid,
        "status":    "pending"
    })
    if not req:
        raise HTTPException(404, "Không tìm thấy fund request pending nào cho project này")

    # Cập nhật fundRequests
    col.update_one(
        {"requestID": req["requestID"]},
        {"$set": {"status": "accepted"}}
    )
    # Cập nhật project
    factory.dao._get_collection("projects").update_one(
        {"projectID": projectId},
        {"$set": {"fundStatus": "approved", "FoundID": uid}}
    )

    return {"message": f"Đã chấp nhận fund request cho project {projectId}"}


# ===== CONTACTS — GET / ACCEPT / REJECT =====

@router.get("/contacts")
def get_contacts(current_user: dict = Depends(get_current_user),
                 factory: ServiceFactory = Depends(get_factory)):
    """Lấy tất cả contact requests liên quan đến user hiện tại"""
    col = factory.dao._get_collection("contacts")
    uid = current_user["userId"]
    docs = list(col.find({
        "$or": [{"senderID": uid}, {"receiverID": uid}]
    }))
    for d in docs:
        d.pop("_id", None)
    return docs


@router.patch("/contacts/{contact_id}/accept")
def accept_contact(contact_id: str,
                   current_user: dict = Depends(get_current_user),
                   factory: ServiceFactory = Depends(get_factory)):
    col = factory.dao._get_collection("contacts")
    req = col.find_one({"contactID": contact_id})
    if not req:
        raise HTTPException(404, "Contact request không tồn tại")
    if req["receiverID"] != current_user["userId"]:
        raise HTTPException(403, "Bạn không phải người nhận")
    col.update_one({"contactID": contact_id}, {"$set": {"status": "accepted"}})
    return {"message": "Đã chấp nhận kết nối"}


@router.patch("/contacts/{contact_id}/reject")
def reject_contact(contact_id: str,
                   current_user: dict = Depends(get_current_user),
                   factory: ServiceFactory = Depends(get_factory)):
    col = factory.dao._get_collection("contacts")
    req = col.find_one({"contactID": contact_id})
    if not req:
        raise HTTPException(404, "Contact request không tồn tại")
    if req["receiverID"] != current_user["userId"]:
        raise HTTPException(403, "Bạn không phải người nhận")
    col.update_one({"contactID": contact_id}, {"$set": {"status": "rejected"}})
    return {"message": "Đã từ chối kết nối"}


# ===== MESSAGES =====

@router.get("/messages/{contact_id}")
def get_messages(contact_id: str,
                 current_user: dict = Depends(get_current_user),
                 factory: ServiceFactory = Depends(get_factory)):
    """Lấy tin nhắn của 1 conversation"""
    docs = list(factory.dao._get_collection("messages").find({"contactID": contact_id}))
    for d in docs:
        d.pop("_id", None)
    return docs


class MessageRequest(BaseModel):
    text: str

@router.post("/messages/{contact_id}", status_code=201)
def send_message(contact_id: str,
                 body: MessageRequest,
                 current_user: dict = Depends(get_current_user),
                 factory: ServiceFactory = Depends(get_factory)):
    """Gửi tin nhắn trong conversation"""
    col_c = factory.dao._get_collection("contacts")
    req   = col_c.find_one({"contactID": contact_id})
    if not req:
        raise HTTPException(404, "Conversation không tồn tại")
    if req["status"] != "accepted":
        raise HTTPException(403, "Kết nối chưa được chấp nhận")
    if current_user["userId"] not in [req["senderID"], req["receiverID"]]:
        raise HTTPException(403, "Bạn không thuộc conversation này")

    import uuid
    msg = {
        "msgID":     str(uuid.uuid4())[:8],
        "contactID": contact_id,
        "fromID":    current_user["userId"],
        "text":      body.text,
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    factory.dao._get_collection("messages").insert_one(msg)
    msg.pop("_id", None)
    return msg