from fastapi import APIRouter

router = APIRouter(prefix="/webhook", tags=["WebHook"])

@router.post("/user")
def user_webhook():
    return {"message": "User webhook received"}