from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import user, webhooks, admin, rider
import uvicorn
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(rider.router, prefix="/rider", tags=["Rider"])

@app.get("/")
def status():
    return {"status": "online"}

def main():
    print("Starting NutriPrep Backend...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)