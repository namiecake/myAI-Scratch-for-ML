from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Literal

class JobCancelRequest(BaseModel):
    """
    Represents the structure of a job cancellation request.
    """
    user_id: str

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
    job_id: str
    user_id: str

class WarningData(BaseModel):
    """
    Represents structure of an error or warning
    """
    message: str = "Design looks good!"
    update_type: Literal["warning", "error", "info"] = "info"
    layer: int = -1
    job_id: str