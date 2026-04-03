# CubeTrack

A serious Rubik's Cube training platform. Timer, analytics, 3D visualizer, Kociemba solver, and an OLL/PLL algorithms hub.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 App Router · TypeScript · Tailwind CSS 4 |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL + Prisma 7 |
| 3D | Three.js |
| Solver | Python · FastAPI · Kociemba |

---

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (or a cloud URL)
- Python 3.10+ (for the solver service)

---

### 1. Environment Variables

Copy `.env.local` and fill in your credentials:

```bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/cubetrack?schema=public"
NEXT_PUBLIC_SOLVER_URL="http://localhost:8000"
```

Prisma reads from `.env` via `prisma.config.ts`. Make sure `DATABASE_URL` is also set in `.env` or that file points to the right place.

---

### 2. Database Setup

```bash
# Install dependencies
npm install

# Push schema to database (creates tables)
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate

# Seed with default user, session, and all OLL + PLL algorithms
npm run db:seed
```

---

### 3. Run the Next.js App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### 4. Run the Python Solver Service

```bash
cd python-service

# Create a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn main:app --reload --port 8000
```

The solver is available at [http://localhost:8000](http://localhost:8000).  
Health check: `GET http://localhost:8000/health`

---

## Features

### Timer (`/timer`)
- Hold **Spacebar** (or tap on mobile) to arm, release to start
- 15-second inspection countdown (toggle-able)
- +2 and DNF penalty support
- Auto-generated WCA-style scrambles
- Stats panel: Current · PB · Worst · Mean · Ao5 · Ao12
- Solve history with per-solve penalty editing and deletion

### 3D Cube (`/cube`)
- Interactive Three.js cube (drag to rotate)
- Enter any algorithm string and press **Play**
- Animated move-by-move playback
- Reusable component used by solver and algorithm detail pages

### Algorithms Hub (`/algorithms`)
- Browse all 57 OLL and 21 PLL cases
- Search by name or move notation
- Filter: All / Learned / Unlearned
- Progress bar per category (e.g. "12/21 PLLs learned")
- Per-algorithm: mark as Learned, mark as Favorite
- Visualize any algorithm on the 3D cube from the detail page

### Solver (`/solver`)
- Input cube state via color grid UI or raw 54-char string
- Frontend validates format before hitting API
- Calls Python Kociemba service for optimal solution
- Click **Visualize Solution** to animate on 3D cube

---

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/sessions` | List sessions |
| POST | `/api/sessions` | Create session |
| GET | `/api/solves?sessionId=` | Get solves |
| POST | `/api/solves` | Save a solve |
| PATCH | `/api/solves/[id]` | Update penalty/notes |
| DELETE | `/api/solves/[id]` | Delete solve |
| GET | `/api/stats?sessionId=` | Get session stats |
| GET | `/api/algorithms?category=OLL` | List algorithms |
| GET | `/api/algorithms/progress` | Get user progress |
| POST | `/api/algorithms/progress` | Toggle learned/favorite |
| POST | `/api/solver` | Proxy to Python solver |

---

## Project Structure

```
/src
  /app                 # Next.js App Router pages + API routes
    /api               # Route handlers
    /timer             # Timer page
    /algorithms        # Algorithms hub
    /cube              # 3D cube page
    /solver            # Solver page
  /components          # Shared UI (Nav)
  /features
    /timer             # Timer hook + display component
    /analytics         # Stats panel + solve list
    /cube-visualizer   # Three.js engine + CubeViewer
    /algorithms        # Algorithm card component
  /lib                 # Shared utilities (db, stats, scramble, moves, constants)
  /types               # Shared TypeScript types
  /generated/prisma    # Auto-generated Prisma client
/prisma
  /seed                # Seed data (OLL + PLL algorithms)
  schema.prisma
  seed.ts
/python-service        # FastAPI solver microservice
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (use Vercel Postgres or Supabase)
   - `NEXT_PUBLIC_SOLVER_URL` (deploy Python service to Railway / Render / Fly.io)
4. Deploy

The Python solver must be deployed separately as it is not part of the Node.js build.

---

## Cube String Format

The solver uses the standard Kociemba face string:

```
UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
```

**Face order:** U · R · F · D · L · B  
**Per face:** 9 characters, left→right, top→bottom  
**Colors:** U=white · R=orange · F=green · D=yellow · L=red · B=blue
