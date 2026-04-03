# CubeTrack Solver Microservice

FastAPI service that wraps the Kociemba two-phase solver.

## Setup

```bash
cd python-service
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health` — liveness check
- `POST /solve` — solve a cube state string
- `POST /scan/face` — (stub) future CV face scanning

## Cube string format

```
UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
```

Face order: **U R F D L B**, reading each face left→right, top→bottom.
A solved cube = `UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB`
