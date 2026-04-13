from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.databaseApi import router as database_router

app = FastAPI(
    title="Database Server",
    version="1.0.0",
    description="Quản lý dữ liệu: experts, enterprises, projects, files, funds",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(database_router)

@app.get("/")
def root():
    return {
        "server": "Database Server",
        "port":   8001,
        "routes": [
            "GET    /api/v1/experts",
            "GET    /api/v1/experts/{id}",
            "GET    /api/v1/enterprises",
            "GET    /api/v1/enterprises/{id}",
            "GET    /api/v1/profile",
            "PATCH  /api/v1/profile",
            "POST   /api/v1/projects",
            "GET    /api/v1/projects",
            "GET    /api/v1/projects/{id}",
            "POST   /api/v1/files/metadata",
            "GET    /api/v1/files/{id}",
            "DELETE /api/v1/account",
            "POST   /api/v1/foundation",
            "POST   /api/v1/funds",
            "POST   /api/v1/projects/{id}/grants",
            "POST   /api/v1/projects/{id}/fund-requests",
        ]
    }
