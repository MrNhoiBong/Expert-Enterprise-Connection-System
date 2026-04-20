from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.business_server.businessApi import router as business_router

ALLOWED_ORIGINS = [
    "http://localhost:6060",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:6060",
]

app = FastAPI(
    title="Business Server",
    version="1.0.0",
    description="Logic nghiệp vụ: contacts, invitations, file upload, call fund",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(business_router)

@app.get("/")
def root():
    return {
        "server": "Business Server",
        "port":   8002,
        "routes": [
            "POST /api/v1/experts/{id}/contacts",
            "POST /api/v1/enterprises/{id}/contacts",
            "POST /api/v1/projects/{id}/invitations",
            "POST /api/v1/invitations/{id}/accept",
            "POST /api/v1/invitations/{id}/reject",
            "POST /api/v1/files/upload",
            "POST /api/v1/image/upload",
            "POST /api/v1/projects/{id}/calls/accept",
        ]
    }