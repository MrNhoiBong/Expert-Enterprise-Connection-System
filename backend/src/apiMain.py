import multiprocessing
import socket
import sys
import os
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

# Tự động detect IP LAN — thêm vào allowed origins
LOCAL_IP = get_local_ip()

ALLOWED_ORIGINS = [
    "http://localhost:6060",
    "http://127.0.0.1:6060",
    f"http://{LOCAL_IP}:6060",   # IP LAN tự động
]

print(f"✅ CORS allowed origins: {ALLOWED_ORIGINS}")


def run_auth():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from api.auth_server.authApi import router as auth_router

    app = FastAPI(title="Auth Server", version="1.0.0")
    app.add_middleware(CORSMiddleware,
                       allow_origins=ALLOWED_ORIGINS,
                       allow_credentials=True,
                       allow_methods=["*"],
                       allow_headers=["*"])
    app.include_router(auth_router)

    @app.get("/")
    def root():
        return {"server": "Auth Server", "port": 8000}

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")


def run_database():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from api.database_server.databaseApi import router as database_router

    app = FastAPI(title="Database Server", version="1.0.0")
    app.add_middleware(CORSMiddleware,
                       allow_origins=ALLOWED_ORIGINS,
                       allow_credentials=True,
                       allow_methods=["*"],
                       allow_headers=["*"])
    app.include_router(database_router)

    @app.get("/")
    def root():
        return {"server": "Database Server", "port": 8001}

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")


def run_business():
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from api.business_server.businessApi import router as business_router

    app = FastAPI(title="Business Server", version="1.0.0")
    app.add_middleware(CORSMiddleware,
                       allow_origins=ALLOWED_ORIGINS,
                       allow_credentials=True,
                       allow_methods=["*"],
                       allow_headers=["*"])
    app.include_router(business_router)

    @app.get("/")
    def root():
        return {"server": "Business Server", "port": 8002}

    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")


if __name__ == "__main__":
    multiprocessing.freeze_support()

    processes = [
        multiprocessing.Process(target=run_auth,     name="AuthServer"),
        multiprocessing.Process(target=run_database, name="DatabaseServer"),
        multiprocessing.Process(target=run_business, name="BusinessServer"),
    ]

    print("🚀 Khởi động 3 servers...")
    print(f"   Auth Server     → http://localhost:8000/docs")
    print(f"   Database Server → http://localhost:8001/docs")
    print(f"   Business Server → http://localhost:8002/docs")
    print(f"   LAN Access      → http://{LOCAL_IP}:6060")

    for p in processes:
        p.start()

    try:
        for p in processes:
            p.join()
    except KeyboardInterrupt:
        print("\n⛔ Đang tắt...")
        for p in processes:
            p.terminate()
        for p in processes:
            p.join()
        print("✅ Đã tắt tất cả servers")