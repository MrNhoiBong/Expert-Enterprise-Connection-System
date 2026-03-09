from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["Business"])


@router.post("/experts/{expert_id}/contacts")
def contact_expert(expert_id: int):
    return {"message": f"Contacted expert {expert_id}"}


@router.post("/enterprises/{enterprise_id}/contacts")
def contact_enterprise(enterprise_id: int):
    return {"message": f"Contacted enterprise {enterprise_id}"}


@router.post("/projects/{project_id}/invitations")
def invite_user(project_id: int):
    return {"message": f"Invitation sent for project {project_id}"}
