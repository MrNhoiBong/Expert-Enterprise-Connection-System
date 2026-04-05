from fastapi import Request, HTTPException, Depends
from businessLogic.serviceFactory import ServiceFactory

_factory: ServiceFactory = None

def get_factory() -> ServiceFactory:
    global _factory
    if _factory is None:
        _factory = ServiceFactory()
    return _factory

def get_current_user(request: Request,
                     factory: ServiceFactory = Depends(get_factory)) -> dict:
    token = request.cookies.get("session")
    if not token:
        raise HTTPException(401, "Chưa đăng nhập")
    user = factory.auth.check(token)
    if not user:
        raise HTTPException(401, "Session hết hạn")
    return user