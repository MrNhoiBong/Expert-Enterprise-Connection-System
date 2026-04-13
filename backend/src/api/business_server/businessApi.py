from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from api.deps import get_factory, get_current_user
from businessLogic.serviceFactory import ServiceFactory
import datetime

router = APIRouter(prefix="/api/v1", tags=["Business"])


# ===== Schemas =====

class ContactRequest(BaseModel):
    message: str

class InvitationRequest(BaseModel):
    user_id: str    # expertID hoặc enterpriseID được mời
    role:    str    # role trong project
    message: str = ""

class FileUploadRequest(BaseModel):
    name:       str
    url:        str
    project_id: str


# ===== CONTACT =====

@router.post("/experts/{expert_id}/contacts", status_code=201)
def contact_expert(expert_id: str,           
                   body: ContactRequest,
                   current_user: dict = Depends(get_current_user),
                   factory: ServiceFactory = Depends(get_factory)):

    expert = factory.expert.get_by_id(expert_id)
    if not expert:
        raise HTTPException(404, "Expert không tồn tại")

    factory.dao.db["contacts"].insert_one({
        "senderID":     current_user["userId"],
        "senderRole":   current_user["role"],
        "receiverID":   expert_id,
        "receiverType": "expert",
        "message":      body.message,
        "status":       "pending",
        "createdAt":    datetime.datetime.utcnow().isoformat()
    })
    return {"message": f"Đã gửi liên hệ tới expert {expert_id}"}


@router.post("/enterprises/{enterprise_id}/contacts", status_code=201)
def contact_enterprise(enterprise_id: str,  
                       body: ContactRequest,
                       current_user: dict = Depends(get_current_user),
                       factory: ServiceFactory = Depends(get_factory)):

    enterprise = factory.enterprise.get_by_id(enterprise_id)
    if not enterprise:
        raise HTTPException(404, "Enterprise không tồn tại")

    factory.dao.db["contacts"].insert_one({
        "senderID":     current_user["userId"],
        "senderRole":   current_user["role"],
        "receiverID":   enterprise_id,
        "receiverType": "enterprise",
        "message":      body.message,
        "status":       "pending",
        "createdAt":    datetime.datetime.utcnow().isoformat()
    })
    return {"message": f"Đã gửi liên hệ tới enterprise {enterprise_id}"}


# ===== INVITATIONS =====

@router.post("/projects/{project_id}/invitations", status_code=201)
def invite_user(project_id: str,             
                body: InvitationRequest,
                current_user: dict = Depends(get_current_user),
                factory: ServiceFactory = Depends(get_factory)):

    # Kiểm tra project tồn tại
    project = factory.project.get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project không tồn tại")

    # Chỉ người tạo project mới được mời
    if project.get("createBy") != current_user["userId"]:
        raise HTTPException(403, "Chỉ người tạo project mới có thể mời")

    col   = factory.dao.db["invitations"]
    count = col.count_documents({})
    inv_id = f"INV{str(count + 1).zfill(4)}"

    col.insert_one({
        "invitationID": inv_id,
        "projectID":    project_id,
        "invitedBy":    current_user["userId"],
        "invitedUser":  body.user_id,
        "role":         body.role,
        "message":      body.message,
        "status":       "pending",
        "createdAt":    datetime.datetime.utcnow().isoformat()
    })
    return {"message": "Đã gửi lời mời", "invitationID": inv_id}


@router.post("/invitations/{invitation_id}/accept")
def accept_invitation(invitation_id: str,
                      current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):

    inv = factory.dao.db["invitations"].find_one({"invitationID": invitation_id})
    if not inv:
        raise HTTPException(404, "Invitation không tồn tại")
    if inv["invitedUser"] != current_user["userId"]:
        raise HTTPException(403, "Bạn không phải người được mời")
    if inv["status"] != "pending":
        raise HTTPException(400, f"Invitation đã ở trạng thái: {inv['status']}")

    # Thêm vào project tuỳ role
    if current_user["role"] == "expert":
        factory.project.add_expert(
            project_id=inv["projectID"],
            expert_id=current_user["userId"],
            role=inv["role"],
            dao_participate=factory.dao
        )
    elif current_user["role"] == "enterprise":
        factory.dao.db["enterpriseParticipate"].insert_one({
            "enterpriseID": current_user["userId"],
            "projectID":    inv["projectID"],
            "role":         inv["role"],
            "joinDate":     datetime.date.today().isoformat(),
            "status":       "active"
        })
    else:
        raise HTTPException(403, "Role không hợp lệ")

    factory.dao.db["invitations"].update_one(
        {"invitationID": invitation_id},
        {"$set": {"status": "accepted"}}
    )
    return {"message": "Đã chấp nhận lời mời"}


@router.post("/invitations/{invitation_id}/reject")
def reject_invitation(invitation_id: str,
                      current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):

    inv = factory.dao.db["invitations"].find_one({"invitationID": invitation_id})
    if not inv:
        raise HTTPException(404, "Invitation không tồn tại")
    if inv["invitedUser"] != current_user["userId"]:
        raise HTTPException(403, "Bạn không phải người được mời")
    if inv["status"] != "pending":
        raise HTTPException(400, f"Invitation đã ở trạng thái: {inv['status']}")

    factory.dao.db["invitations"].update_one(
        {"invitationID": invitation_id},
        {"$set": {"status": "rejected"}}
    )
    return {"message": "Đã từ chối lời mời"}


# ===== FILE UPLOAD =====

@router.post("/files/upload", status_code=201)
async def upload_file(
    file:       UploadFile  = File(...),
    project_id: str         = Form(...),
    current_user: dict      = Depends(get_current_user),
    factory: ServiceFactory = Depends(get_factory)
):
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert mới có thể upload file")

    # Kiểm tra owner hoặc thành viên
    project = factory.project.get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project không tồn tại")

    is_owner  = project.get("createBy") == current_user["userId"]
    is_member = bool(factory.dao.search(
        "expertParticipate",
        {"expertID": current_user["userId"], "projectID": project_id}
    ))
    if not is_owner and not is_member:
        raise HTTPException(403, "Bạn không tham gia project này")

    # ✅ Bước 1: Upload file lên MinIO
    file_data = await file.read()
    image_doc = factory.image_dao.upload(        # dùng thẳng DAO
        file_data=file_data,
        file_name=file.filename,
        content_type=file.content_type,
        uploaded_by=current_user["userId"],
        project_id=project_id
    )

    # ✅ Bước 2: Lưu metadata vào MongoDB qua documentService
    doc_id = factory.document.upload(
        expert_id=current_user["userId"],
        project_id=project_id,
        name=file.filename,
        url=image_doc.link    # url từ MinIO
    )

    return {
        "message":   "Upload thành công",
        "docID":     doc_id,           # MongoDB ID
        "fileID":    image_doc.id,     # MinIO ID
        "url":       image_doc.link,   # MinIO URL
        "file_name": file.filename,
        "size_kb":   round(image_doc.size / 1024, 1)
    }

# ===== CALL FUND - ACCEPT =====

@router.post("/projects/{project_id}/calls/accept")
def accept_call_fund(project_id: str,
                     current_user: dict = Depends(get_current_user),
                     factory: ServiceFactory = Depends(get_factory)):

    if current_user["role"] not in ("foundation", "funding"):
        raise HTTPException(403, "Chỉ Foundation mới có thể accept fund call")

    project = factory.project.get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project không tồn tại")
    if not project.get("FoundID"):
        raise HTTPException(400, "Project chưa có fund request")
    if project["FoundID"] != current_user["userId"]:
        raise HTTPException(403, "Fund request này không thuộc foundation của bạn")

    factory.dao._get_collection("projects").update_one(
        {"projectID": project_id},
        {"$set": {"fundStatus": "approved"}}
    )
    return {"message": f"Đã chấp nhận fund request cho project {project_id}"}