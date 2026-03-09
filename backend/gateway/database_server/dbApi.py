from fastapi import APIRouter, Body

router = APIRouter(prefix="/api/v1", tags=["Database"])


@router.get("/experts")
def find_experts():
    return [{"id": 1, "name": "Expert A"}]


@router.get("/experts/{expert_id}")
def expert_detail(expert_id: int):
    return {"id": expert_id, "name": f"Expert {expert_id}"}


@router.get("/enterprises")
def find_enterprises():
    return [{"id": 1, "name": "Enterprise A"}]


@router.get("/profile")
def get_profile():
    return {"id": 1, "name": "Demo User"}


@router.patch("/profile")
def update_profile(profile: dict = Body(...)):
    return {"message": "Profile updated", "profile": profile}


@router.post("/projects")
def create_project(project: dict = Body(...)):
    return {"message": "Project created", "project": project}
