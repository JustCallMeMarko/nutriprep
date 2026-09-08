from pydantic import BaseModel

class UserWebhook(BaseModel):
    user_id: str
    