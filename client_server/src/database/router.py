from fastapi import APIRouter, Depends, HTTPException
from google.cloud import tasks_v2
import json
import os
import time
from src.utils import DiagramRequest, WarningData, JobCancelRequest, UserCompleteChallenge
from src.security import verify_firebase_token, db
import re
import requests
import logging
from ..websocket_manager import manager
import asyncio
from collections import defaultdict
from google.cloud import firestore
from google.oauth2 import service_account
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

project = "cs194-449021"
project_number = "590321385188" # Associated with project, it's not publically exposed
location = "us-west1"


# Initialize the FastAPI router
router = APIRouter()


@router.post("/user-complete-challenge")
async def user_complete_challenge(request: UserCompleteChallenge):
    try:
        document_data = {
            "challenge_information": 
            {
                request.challenge_id_completed: {
                    "completed": True
                }
            }
        }
        doc_ref = db.collection('users').document(request.user_id)
        doc_ref.set(document_data, merge=True)  # Merge keeps existing fields
        return {"message": "Document updated successfully."}
    except Exception as e:
        logger.error(f"Error updating document: {str(e)}")
        return {"message": str(e)}

@router.get("/user-data")
async def get_user_data(user: dict = Depends(verify_firebase_token)):
    """Fetch the authenticated user's data from Firestore."""
    try:
        user_id = user["uid"]  # Extract Firebase user ID
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_doc.to_dict()
        user_data["id"] = user_id  # Include user ID

        return {"user": user_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user data: {str(e)}")
