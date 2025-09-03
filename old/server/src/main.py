from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from . import playground

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to specific origins for security)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# origins = [
#     "*"
# ]

app.include_router(playground.router, prefix="/playground")

@app.get("/")
async def root():
    return {"message": "Hello World"}

