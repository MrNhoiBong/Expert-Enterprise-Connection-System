import multiprocessing
import sys
import os
import uvicorn

from api.auth_server import authApi

# ✅ Thêm backend folder vào sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def run_auth():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from api.auth_server.authApi import router as auth_router

    app = FastAPI(title="Permission Server - Auth", version="1.0.0")
    app.add_middleware(CORSMiddleware, allow_origins=["*"],
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    app.include_router(auth_router)

    @app.get("/")
    def root():
        return {"server": "Permission Server", "port": 8000, "docs": "http://localhost:8000/docs"}

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")


def run_database():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from api.database_server.databaseApi import router as database_router

    app = FastAPI(title="Database Server", version="1.0.0")
    app.add_middleware(CORSMiddleware, allow_origins=["*"],
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    app.include_router(database_router)

    @app.get("/")
    def root():
        return {"server": "Database Server", "port": 8001, "docs": "http://localhost:8001/docs"}

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")


def run_business():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from api.business_server.businessApi import router as business_router

    app = FastAPI(title="Business Server", version="1.0.0")
    app.add_middleware(CORSMiddleware, allow_origins=["*"],
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    app.include_router(business_router)

    @app.get("/")
    def root():
        return {"server": "Business Server", "port": 8002, "docs": "http://localhost:8002/docs"}

    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")


if __name__ == "__main__":
    multiprocessing.freeze_support()   # ✅ bắt buộc trên Windows

    processes = [
        multiprocessing.Process(target=run_auth,     name="AuthServer"),
        multiprocessing.Process(target=run_database, name="DatabaseServer"),
        multiprocessing.Process(target=run_business, name="BusinessServer"),
    ]

    print("🚀 Khởi động 3 servers...")
    print("   Auth Server     → http://localhost:8000/docs")
    print("   Database Server → http://localhost:8001/docs")
    print("   Business Server → http://localhost:8002/docs")

    for p in processes:
        p.start()

    try:
        for p in processes:
            p.join()
    except KeyboardInterrupt:
        print("\n⛔ Đang tắt tất cả servers...")
        for p in processes:
            p.terminate()
        for p in processes:
            p.join()
        print("✅ Đã tắt tất cả servers")