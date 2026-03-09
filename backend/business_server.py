from fastapi import FastAPI
import uvicorn
import socket

from gateway.business_server.blApi import router as bl_router

app = FastAPI(version="0.1.0")

def get_free_port():
    """OS tự cấp port trống"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("", 0))
    port = s.getsockname()[1]
    s.close()
    return port

app.include_router(bl_router)

@app.get("/")
def root():
    return {"status": "Business server OK"}

if __name__ == "__main__":
    BIND_HOST = "0.0.0.0"        # server bind
    PUBLIC_HOST = "127.0.0.1"   # client access
    PORT = 8002

    print(f"🚀 Business Server running at http://{PUBLIC_HOST}:{PORT}")

    uvicorn.run(
        app,
        host=PUBLIC_HOST,
        port=PORT,
        reload=False
    )


