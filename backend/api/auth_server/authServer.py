from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.authApi import router as auth_router

app = FastAPI(
    title="Permission Server - Auth",
    version="1.0.0",
    description="Xác thực và phân quyền người dùng",
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

app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "server":  "Permission Server",
        "port":    8000,
        "routes": [
            "POST /api/v1/auth/register",
            "POST /api/v1/auth/login",
            "POST /api/v1/auth/logout",
            "PATCH /api/v1/auth/username",
            "PATCH /api/v1/auth/password",
        ]
    }
