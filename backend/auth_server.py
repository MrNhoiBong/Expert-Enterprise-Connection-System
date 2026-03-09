from fastapi import FastAPI
import uvicorn

from gateway.auth_server.authApi import router as auth_router

app = FastAPI(version="0.1.0")

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "Auth server OK"}

if __name__ == "__main__":
    BIND_HOST = "0.0.0.0"        # server bind
    PUBLIC_HOST = "127.0.0.1"   # client access
    PORT = 8001

    print(f"🚀 Auth Server running at http://{PUBLIC_HOST}:{PORT}")

    uvicorn.run(
        app,
        host=PUBLIC_HOST,
        port=PORT,
        reload=False
    )


