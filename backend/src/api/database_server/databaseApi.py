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
    skills:         list = None   # expert only
    experience:     int  = None   # expert only
    profileSummary: str  = None   # expert only
    company_name:   str  = None   # enterprise only
    phone:          str  = None   # enterprise only
    avatarUrl:      str  = None   # avatar image URL (MinIO)

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
    amount:      float = 0.0   # số tiền tài trợ (USD)

class FundRequestBody(BaseModel):
    found_id: str


# ===== EXPERTS =====

@router.get("/experts")
def find_experts(name: Optional[str] = Query(None),
                 skill: Optional[str] = Query(None),
                 factory: ServiceFactory = Depends(get_factory)):
    if name:
        return factory.expert.search_by_name(name)
    if skill:
        return factory.expert.search_by_skill(skill)
    return factory.expert.get_all()


@router.get("/experts/{id}")
def get_expert(id: str, factory: ServiceFactory = Depends(get_factory)):
    result = factory.expert.get_by_id(id)
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


@router.get("/enterprises/{id}")
def get_enterprise(id: str, factory: ServiceFactory = Depends(get_factory)):
    result = factory.enterprise.get_by_id(id)
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

    update_data = {k: v for k, v in body.dict().items() if v is not None}
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


# ===== AI Helper =====

OLLAMA_URL   = "http://10.103.240.27:8181/api/generate"
OLLAMA_MODEL = "llama3:8b"

def suggest_skills_from_ai(description: str, expert_skills: list) -> list:
    """
    Gọi Ollama llama3:8b gợi ý skills cho project.
    - Nếu expert có skills: chọn skills phù hợp từ danh sách có sẵn
    - Nếu expert chưa có skills: tự gợi ý skills từ description
    Non-blocking — lỗi thì trả [] không crash API.
    """
    import json, urllib.request, urllib.error

    if expert_skills:
        skills_str = ", ".join(expert_skills)
        prompt = (
            "You are a project skill matcher. "
            "Given a project description and a list of available skills in the system, "
            "return ONLY a JSON array (max 10 items) of the most relevant skills "
            "from the available list that match the project needs. "
            "No explanation, no markdown, just the JSON array.\n\n"
            f"Project description: {description}\n"
            f"Available skills in system: {skills_str}\n\n"
            "Example output: [\"Python\", \"FastAPI\", \"MongoDB\"]"
        )
    else:
        prompt = (
            "You are a tech skill recommender. "
            "Given a project description, suggest the most relevant technical skills needed. "
            "Return ONLY a JSON array of max 5 skill names. No explanation, no markdown.\n\n"
            f"Project description: {description}\n\n"
            "Example output: [\"Python\", \"FastAPI\", \"MongoDB\"]"
        )

    try:
        payload = json.dumps({
            "model":  OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }).encode("utf-8")

        req = urllib.request.Request(
            OLLAMA_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=20) as resp:
            body = json.loads(resp.read().decode("utf-8"))

        text = body.get("response", "").strip()
        print(f"[AI] Raw response: {text[:200]}")

        # Parse JSON array từ response
        start = text.find("[")
        end   = text.rfind("]") + 1
        if start != -1 and end > start:
            skills = json.loads(text[start:end])
            return [s for s in skills if isinstance(s, str)][:5]
        return []

    except urllib.error.URLError as e:
        print(f"[AI] URLError: {e}")
        return []
    except TimeoutError:
        print("[AI] Timeout — skip skill suggestion")
        return []
    except Exception as e:
        print(f"[AI] Error: {e}")
        return []


# ===== PROJECTS =====

@router.post("/projects", status_code=201)
async def create_project(body: ProjectCreateRequest,
                         current_user: dict = Depends(get_current_user),
                         factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert mới có thể tạo project")

    # Tạo project
    project_id = factory.project.create(
        expert_id=current_user["userId"],
        name=body.name,
        description=body.description,
        start_date=body.start_date,
        end_date=body.end_date
    )

    # Lấy TẤT CẢ skills unique từ toàn bộ experts trong hệ thống
    # → AI chọn skills phù hợp với project description từ pool này
    all_experts = factory.dao._get_collection("experts").find(
        {}, {"skills": 1, "_id": 0}
    )
    all_skills_pool = list({
        skill
        for doc in all_experts
        for skill in (doc.get("skills") or [])
        if isinstance(skill, str) and skill.strip()
    })

    print(f"[AI] Skills pool ({len(all_skills_pool)}): {all_skills_pool}")

    # Gọi AI gợi ý skills phù hợp với description từ pool toàn hệ thống
    suggested_skills = []
    if body.description:
        suggested_skills = suggest_skills_from_ai(body.description, all_skills_pool)

    # Gắn suggested_skills vào project nếu AI trả về kết quả
    if suggested_skills:
        factory.dao._get_collection("projects").update_one(
            {"projectID": project_id},
            {"$set": {"suggestedSkills": suggested_skills}}
        )

    return {
        "message":         "Tạo project thành công",
        "projectID":       project_id,
        "suggestedSkills": suggested_skills,  # trả về FE để hiển thị
    }


@router.get("/projects")
def find_projects(name: Optional[str] = Query(None),
                  status: Optional[str] = Query(None),
                  factory: ServiceFactory = Depends(get_factory)):
    if name:
        results = factory.dao.search("projects", {"name": {"$regex": name, "$options": "i"}})
        return [r.data for r in results]
    if status:
        return factory.project.get_by_status(status)
    return factory.project.get_all()


@router.get("/projects/{id}")
def get_project(id: str, factory: ServiceFactory = Depends(get_factory)):
    result = factory.project.get_by_id(id)
    if not result:
        raise HTTPException(404, "Project không tồn tại")

    # Trả về overview đầy đủ
    experts     = factory.project.get_experts(id, factory.dao)
    enterprises = factory.project.get_enterprises(id, factory.dao)
    documents   = factory.project.get_documents(id, factory.dao)

    return {
        "project":     result,
        "experts":     experts,
        "enterprises": enterprises,
        "documents":   documents
    }


# ===== FILE METADATA =====

@router.post("/files/metadata", status_code=201)
def create_file_metadata(body: FileMetadataRequest,
                         current_user: dict = Depends(get_current_user),
                         factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert mới có thể upload file")

    doc_id = factory.document.upload(
        expert_id=current_user["userId"],
        project_id=body.project_id,
        name=body.name,
        url=body.url
    )
    return {"message": "Tạo file metadata thành công", "docID": doc_id}


@router.get("/files/{id}")
def get_file(id: str, factory: ServiceFactory = Depends(get_factory)):
    result = factory.document.get_by_id(id)
    if not result:
        raise HTTPException(404, "File không tồn tại")
    return result


@router.delete("/files/{id}")
def delete_file(id: str,
                current_user: dict = Depends(get_current_user),
                factory: ServiceFactory = Depends(get_factory)):
    """Xoá file — owner hoặc bất kỳ expert member nào trong project đều xoá được"""
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert mới có thể xoá file")

    doc = factory.document.get_by_id(id)
    if not doc:
        raise HTTPException(404, "File không tồn tại")

    uid        = current_user["userId"]
    project_id = doc.get("contain", "")
    project    = factory.project.get_by_id(project_id)

    is_owner  = project and project.get("createBy") == uid
    is_member = bool(factory.dao.search(
        "expertParticipate",
        {"expertID": uid, "projectID": project_id}
    ))

    if not is_owner and not is_member:
        raise HTTPException(403, "Bạn không tham gia project này")

    factory.dao._get_collection("documents").delete_one({"docID": id})
    return {"message": "Xoá file thành công", "docID": id}


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

    factory.dao._get_collection(col_name).delete_one({id_field: current_user["userId"]})
    return {"message": "Xoá account thành công"}


# ===== FOUNDATION & FUND =====

@router.post("/foundation", status_code=201)
def create_foundation(body: FoundationCreateRequest,
                      current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):
    col  = factory.dao._get_collection("foundation")
    count = col.count_documents({})
    fid  = f"FND{str(count + 1).zfill(3)}"

    col.insert_one({
        "FoundID":     fid,
        "name":        body.name,
        "type":        body.type,
        "createDate":  datetime.date.today().isoformat(),
        "description": body.description
    })
    return {"message": "Tạo foundation thành công", "FoundID": fid}


@router.get("/funds")
def get_funds(factory: ServiceFactory = Depends(get_factory)):
    """Lấy tất cả funds từ collection createFund"""
    docs = list(factory.dao._get_collection("createFund").find({}))
    for d in docs: d.pop("_id", None)
    return docs


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


@router.get("/grants")
def get_grants(factory: ServiceFactory = Depends(get_factory)):
    """Lấy tất cả grant records"""
    docs = list(factory.dao._get_collection("grant").find({}))
    for d in docs:
        d.pop("_id", None)
    return docs


@router.post("/projects/{projectId}/grants", status_code=201)
def grant_project(projectId: str,
                  body: GrantProjectRequest,
                  current_user: dict = Depends(get_current_user),
                  factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "enterprise":
        raise HTTPException(403, "Chỉ Enterprise mới có thể grant project")

    msg = factory.enterprise.grant_project(
        enterprise_id=current_user["userId"],
        project_id=projectId,
        description=body.description,
        amount=body.amount,
        dao_grant=factory.dao
    )
    return {"message": msg}


@router.get("/fund-requests")
def get_fund_requests(current_user: dict = Depends(get_current_user),
                      factory: ServiceFactory = Depends(get_factory)):
    """
    Expert: lấy fund requests của project mình tạo
    Foundation: lấy tất cả fund requests gửi đến mình
    """
    col = factory.dao._get_collection("fundRequests")
    uid = current_user["userId"]
    if current_user["role"] == "expert":
        docs = list(col.find({"requestBy": uid}))
    else:
        docs = list(col.find({"foundID": uid}))
    for d in docs: d.pop("_id", None)
    return docs


@router.post("/projects/{projectId}/fund-requests", status_code=201)
def fund_request(projectId: str,
                 body: FundRequestBody,
                 current_user: dict = Depends(get_current_user),
                 factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] != "expert":
        raise HTTPException(403, "Chỉ Expert (project owner) mới có thể gửi fund request")

    project = factory.project.get_by_id(projectId)
    if not project:
        raise HTTPException(404, "Project không tồn tại")
    if project.get("createBy") != current_user["userId"]:
        raise HTTPException(403, "Chỉ owner của project mới có thể call fund")

    import uuid
    req_id = str(uuid.uuid4())[:8]
    factory.dao._get_collection("fundRequests").insert_one({
        "requestID":  req_id,
        "projectID":  projectId,
        "projectName": project.get("name", ""),
        "requestBy":  current_user["userId"],
        "foundID":    body.found_id,
        "status":     "pending",
        "createdAt":  __import__("datetime").datetime.utcnow().isoformat()
    })

    # Cũng lưu FoundID vào project để backward compat
    factory.project.assign_funding(projectId, body.found_id)
    return {"message": f"Đã gửi fund request tới {body.found_id}", "requestID": req_id}


@router.patch("/fund-requests/{requestId}/reject")
def reject_fund_request(requestId: str,
                        current_user: dict = Depends(get_current_user),
                        factory: ServiceFactory = Depends(get_factory)):
    if current_user["role"] not in ("foundation", "funding"):
        raise HTTPException(403, "Chỉ Foundation mới có thể từ chối")
    col = factory.dao._get_collection("fundRequests")
    req = col.find_one({"requestID": requestId})
    if not req:
        raise HTTPException(404, "Request không tồn tại")
    if req["foundID"] != current_user["userId"]:
        raise HTTPException(403, "Request này không thuộc foundation của bạn")
    col.update_one({"requestID": requestId}, {"$set": {"status": "rejected"}})
    return {"message": "Đã từ chối fund request"}