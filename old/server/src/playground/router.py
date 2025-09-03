from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List, Literal

# Define the structure for individual blocks in the pipeline
class Block(BaseModel):
    """
    Represents a single block in the pipeline.
    """
    block_id: str
    order: int
    params: Dict[str, Any]  # Parameters specific to the block

# Define the request schema for the API
class DiagramRequest(BaseModel):
    """
    Represents the structure of a diagram request.
    """
    # all blocks of the pipeline
    blocks: List[Block]  
    execution: Literal["eval", "train"]  
    dataset: str  # filename of dataset
    optimizer: str
    loss_fn: str
    evalFns: List[str]
    lr: float
    epochs: int

# Initialize the FastAPI router
router = APIRouter()

@router.post("/process-diagram/")
def process_diagram(data: DiagramRequest):
    """
    Endpoint to process the pipeline diagram.
    Receives the blocks, execution type, and dataset and returns confirmation.
    """
    return {
        "message": "Diagram received",
        "data": data
    }

@router.post("/validate-diagram/")
def validate_diagram(data: DiagramRequest):
    """
    Endpoint to validate the structure and rules of the provided pipeline diagram.
    Ensures all required blocks and their rules are satisfied.
    """
    # Need to check layer size
    return {
        "message": "Diagram validated successfully",
        "data": data
    }
