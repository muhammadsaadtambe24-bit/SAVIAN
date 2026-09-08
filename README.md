# 🚆 SAVIAN

**AI-powered Railway Block Scheduling & Arbitration System**

Smart India Hackathon (SIH) 2026 — West Central Railway, Bina–Itarsi Corridor

## What it does

SAVIAN ingests BDMS-shaped maintenance demand data, applies trust-weighted scoring, and runs a Google OR-Tools CP-SAT constraint-programming solver to produce a collision-free, prioritized, and auditable block plan.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python FastAPI + Uvicorn + SQLModel + OR-Tools CP-SAT |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + D3.js |
| Database | SQLite (async) |

## Quick Start

### Prerequisites
- Node.js v20+
- Python 3.11+

### Setup
```bash
npm install
npm run install:all
```

### Run
```bash
npm run dev
```

- App: http://localhost:5173
- API docs: http://localhost:8000/docs
