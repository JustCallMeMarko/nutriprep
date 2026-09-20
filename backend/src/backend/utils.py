import os

from dotenv import load_dotenv
from fastapi import HTTPException, Request
from clerk_backend_api import Clerk, AuthenticateRequestOptions

load_dotenv()


clerk_sdk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

def authenticate_and_get_user_details(request: Request):
    if not os.getenv("CLERK_SECRET_KEY"):
        raise HTTPException(status_code=500, detail="Authentication is not configured")

    authorized_parties = [
        party.strip()
        for party in os.getenv("CLERK_AUTHORIZED_PARTIES", "http://localhost:5173").split(",")
        if party.strip()
    ]

    try:
        request_state = clerk_sdk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                authorized_parties=authorized_parties,
                jwt_key=os.getenv("JWT_KEY")
            )
        )

        if not request_state.is_signed_in:
            raise HTTPException(status_code=401, detail="Authentication required")

        user_id = request_state.payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication token")

        return {"user_id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token") from e