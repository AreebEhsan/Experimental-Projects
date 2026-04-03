"""
CubeTrack Solver Microservice
FastAPI + Kociemba for optimal Rubik's Cube solutions.
OpenCV is structured as a placeholder for future CV work.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import kociemba

app = FastAPI(title="CubeTrack Solver", version="1.0.0")

# Allow local Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_FACES = set("URFDLB")
CUBE_LENGTH = 54


class SolveRequest(BaseModel):
    cube_string: str

    @field_validator("cube_string")
    @classmethod
    def validate_cube_string(cls, v: str) -> str:
        v = v.strip().upper()
        if len(v) != CUBE_LENGTH:
            raise ValueError(
                f"cube_string must be exactly {CUBE_LENGTH} characters, got {len(v)}"
            )
        invalid = set(v) - VALID_FACES
        if invalid:
            raise ValueError(f"Invalid characters: {invalid}. Use U R F D L B only.")
        counts = {c: v.count(c) for c in VALID_FACES}
        bad = {c: n for c, n in counts.items() if n != 9}
        if bad:
            raise ValueError(
                f"Each face must appear exactly 9 times. Off: {bad}"
            )
        return v


class SolveResponse(BaseModel):
    solution: str
    move_count: int


class ErrorResponse(BaseModel):
    error: str


@app.get("/health")
def health():
    return {"status": "ok", "solver": "kociemba"}


@app.post("/solve", response_model=SolveResponse)
def solve(req: SolveRequest):
    """
    Solve a Rubik's Cube given its state string.

    The cube string format follows the kociemba convention:
    UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB

    Face order: U R F D L B, reading left-to-right, top-to-bottom for each face.
    """
    try:
        solution = kociemba.solve(req.cube_string)
        moves = [m for m in solution.strip().split() if m]
        return SolveResponse(solution=solution.strip(), move_count=len(moves))
    except Exception as e:
        msg = str(e)
        if "Error" in msg or "invalid" in msg.lower():
            raise HTTPException(status_code=422, detail=f"Invalid cube state: {msg}")
        raise HTTPException(status_code=500, detail=f"Solver error: {msg}")


# ── Future CV endpoints (stubbed) ─────────────────────────────────────────────

class ScanFaceResponse(BaseModel):
    face: str
    colors: list[str]   # 9 colors detected for this face
    confidence: float


@app.post("/scan/face", response_model=ScanFaceResponse)
def scan_face():
    """
    TODO: Accept a base64-encoded image of one cube face and return
    the detected 9 sticker colors.
    Requires OpenCV color classification — not implemented in MVP.
    """
    raise HTTPException(
        status_code=501,
        detail="CV face scanning not implemented yet. Use manual cube string input.",
    )
