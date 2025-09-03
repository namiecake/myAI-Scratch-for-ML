from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Literal

class UserCompleteChallenge(BaseModel):
    """
    Represents the structure of a database update request.
    """
    user_id: str
    challenge_id_completed: str