from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from api.deps import get_factory, get_current_user
from businessLogic.serviceFactory import ServiceFactory
import datetime

router = APIRouter(prefix="/api/v1", tags=["Database"])


# ===== Schemas =====

class ProjectCreateRequest(BaseModel):
    name:        str
    description: str
    start_date:  str
    end_date:    str

class ProfileUpdateRequest(BaseModel):
    name:           str = None
    email:          str = None
    skills:         list = None    # expert only
    experience:     int  = None    # expert only
    profileSummary: str  = None    # expert only
    company_name:   str  = None    # enterprise only
    phone:          str  = None    # enterprise only

class FileMetadataRequest(BaseModel):
    name:       str
    url:        str
    project_id: str

class FoundationCreateRequest(BaseModel):
    name:        str
    type:        str
    description: str

class FundCreateRequest(BaseModel):
    fund_name: str
    founder:   str

class GrantProjectRequest(BaseModel):
    description: str

class FundRequestBody(BaseModel):
    found_id: str


# ===== EXPERTS =====

@router.get("/experts")
def find_experts(name:  Optional[str] = Query(None),
                 skill: Optional[str] = Query(None),
                 factory: ServiceFactory = Depends(get_factory)):
    if name:
        return factory.expert.search_by_name(name)
    if skill:
        return factory.expert.search_by_skill(skill)
    return factory.expert.get_all()


@router.get("/experts/{expert_id}")        # ✅ str không phải int
def expert_detail(expert_id: str,
                  factory: ServiceFactory = Depends(get_factory)):
    result = factory.expert.get_by_id(expert_id)
    if not result:
        raise HTTPException(404, "Expert không tồn tại")
    return result


# ===== ENTERPRISES =====

@router.get("/enterprises")
def find_enterprises(name: Optional[str] = Query(None),
                     factory: ServiceFactory = Depends(get_factory)):
    if name:
        return factory.enterprise.search_by_name(name)
    return factory.enterprise.get_all()


@router.get("/enterprises/{enterprise_id}")
def enterprise_detail(enterprise_id: str,
                      factory: ServiceFactory = Depends(get_factory)):
    result = factory.enterprise.get_by_id(enterprise_id)
    if not result:
        raise HTTPException(404, "Enterprise không tồn tại")
    return result


# ===== PROFILE =====

@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user),
                factory: ServiceFactory = Depends(get_factory)):
    role = current_user["role"]
    uid  = current_user["userId"]

    if role == "expert":
        return factory.expert.get_by_id(uid)
    elif role == "enterprise":
        return factory.enterprise.get_by_id(uid)
    elif role in ("foundation", "funding"):
        return factory.foundation.get_foundation_by_id(uid)

    raise HTTPException(404, "Không tìm thấy profile")


@router.patch("/profile")
def update_profile(body: ProfileUpdateRequest,
                   current_user: dict = Depends(get_current_user),
                   factory: ServiceFactory = Depends(get_factory)):
    role = current_user["role"]
    uid  = current_user["userId"]

    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(400, "Không có dữ liệu cập nhật")

    col_map = {
        "expert":     ("experts",     "expertID"),
        "enterprise": ("enterprises", "enterpriseID"),
        "foundation": ("foundation",  "FoundID"),
    }
    col_name, id_field = col_map.get(role, (None, None))
    if not col_name:
        raise HTTPException(403, "Role không hợp lệ")

    factory.dao._get_collection(col_name).update_one(
        {id_field: uid},
        {"$set": update_data}
    )
    return {"message": "Cập nhật profile thành công"}


# ===== PROJECTS =====

@router.post("/projects", status_code=201)
def create_project(body: ProjectCreateRequest,
                   current_user: dict = Depends(get_current_user),
                   factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert mới có thể tạo project")

    project_id = factory.project.create(
        expert_id=current_user["userId"],
        name=body.name,
        description=body.description,
        start_date=body.start_date,
        end_date=body.end_date
    )
    return {"message": "Tạo project thành công", "projectID": project_id}


@router.get("/projects")
def find_projects(name:   Optional[str] = Query(None),
                  status: Optional[str] = Query(None),
                  factory: ServiceFactory = Depends(get_factory)):
    if name:
        results = factory.dao.search("projects", {"name": {"$regex": name, "$options": "i"}})
        return [r.data for r in results]
    if status:
        return factory.project.get_by_status(status)
    return factory.project.get_all()


@router.get("/projects/{project_id}")
def project_detail(project_id: str,
                   factory: ServiceFactory = Depends(get_factory)):
    result = factory.project.get_by_id(project_id)
    if not result:
        raise HTTPException(404, "Project không tồn tại")

    return {
        "project":     result,
        "experts":     factory.project.get_experts(project_id, factory.dao),
        "enterprises": factory.project.get_enterprises(project_id, factory.dao),
        "documents":   factory.project.get_documents(project_id, factory.dao)
    }


# ===== FILE METADATA =====

@router.post("/files/metadata", status_code=201)
def create_file_metadata(body: FileMetadataRequest,
                         current_user: dict = Depends(get_current_user),
                         factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert mới có thể tạo file metadata")

    doc_id = factory.document.upload(
        expert_id=current_user["userId"],
        project_id=body.project_id,
        name=body.name,
        url=body.url
    )
    return {"message": "Tạo file metadata thành công", "docID": doc_id}


@router.get("/files/{file_id}")
def get_file(file_id: str,
             factory: ServiceFactory = Depends(get_factory)):
    result = factory.document.get_by_id(file_id)
    if not result:
        raise HTTPException(404, "File không tồn tại")
    return result


# ===== DELETE ACCOUNT =====

@router.delete("/account")
def delete_account(current_user: dict = Depends(get_current_user),
                   factory: ServiceFactory = Depends(get_factory)):
    col_map = {
        "expert":     ("experts",     "expertID"),
        "enterprise": ("enterprises", "enterpriseID"),
        "foundation": ("foundation",  "FoundID"),
    }
    col_name, id_field = col_map.get(current_user["role"], (None, None))
    if not col_name:
        raise HTTPException(403, "Không thể xoá account này")

    factory.dao._get_collection(col_name).delete_one(
        {id_field: current_user["userId"]}
    )
    return {"message": "Xoá account thành công"}


# ===== FOUNDATION & FUND =====

@router.post("/foundation", status_code=201)
def create_foundation(body: FoundationCreateRequest,
                      current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):
    col   = factory.dao._get_collection("foundation")
    count = col.count_documents({})
    fid   = f"FND{str(count + 1).zfill(3)}"

    col.insert_one({
        "FoundID":     fid,
        "name":        body.name,
        "type":        body.type,
        "createDate":  datetime.date.today().isoformat(),
        "description": body.description
    })
    return {"message": "Tạo foundation thành công", "FoundID": fid}


@router.post("/funds", status_code=201)
def create_fund(body: FundCreateRequest,
                current_user: dict = Depends(get_current_user),
                factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] not in ("foundation", "funding"):
        raise HTTPException(403, "Chỉ Foundation mới có thể tạo fund")

    msg = factory.foundation.create_fund(
        found_id=current_user["userId"],
        fund_name=body.fund_name,
        founder=body.founder
    )
    return {"message": msg}


@router.post("/projects/{project_id}/grants", status_code=201)
def grant_project(project_id: str,
                  body: GrantProjectRequest,
                  current_user: dict = Depends(get_current_user),
                  factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "enterprise":
        raise HTTPException(403, "Chỉ Enterprise mới có thể grant project")

    msg = factory.enterprise.grant_project(
        enterprise_id=current_user["userId"],
        project_id=project_id,
        description=body.description,
        dao_grant=factory.dao
    )
    return {"message": msg}


@router.post("/projects/{project_id}/fund-requests", status_code=201)
def fund_request(project_id: str,
                 body: FundRequestBody,
                 current_user: dict = Depends(get_current_user),
                 factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert (project owner) mới có thể gửi fund request")

    # Kiểm tra đúng owner
    project = factory.project.get_by_id(project_id)
    if not project:
        raise HTTPException(404, "Project không tồn tại")
    if project.get("createBy") != current_user["userId"]:
        raise HTTPException(403, "Bạn không phải owner của project này")

    msg = factory.project.assign_funding(project_id, body.found_id)
    return {"message": msg}