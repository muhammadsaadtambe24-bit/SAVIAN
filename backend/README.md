# SAVIAN — Railway Arbitration Platform (Backend Microservices)

N-Tier Microservices Architecture matching Indian Railways Smart India Hackathon (SIH) Specification.

---

## 🏗️ Architecture Stack

* **Arbitration Backend**: Python 3.11 + FastAPI
* **Mathematical Optimization**: Google OR-Tools (CP-SAT Constraint Programming)
* **Sensor Confidence Scoring**: NumPy Trust-Weighted Scorer
* **Persistence & Compliance**: SQLAlchemy + SQLite / PostgreSQL
* **Compliance Ledger**: RDSO-compliant Form T/409 Cryptographic Audit Trail
* **API Gateway & Routing**: NGINX (Rate limiting, SSL, SSE Proxy)
* **Live Streaming**: Server-Sent Events (SSE) for real-time telemetry streaming

---

## 🚀 How to Run

### 1. Direct Python Mode (Recommended for Quick Local Testing)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python run.py
```
* **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Docker Compose Mode (Full Production Stack with NGINX & PostgreSQL)
From the project root directory:
```bash
docker-compose up --build
```
* **NGINX API Gateway**: `http://localhost/`
* **FastAPI Backend**: `http://localhost:8000/`
* **Frontend Cockpit**: `http://localhost:5173/`
* **PostgreSQL Database**: `localhost:5432`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Live backend and OR-Tools readiness check |
| `GET` | `/api/demands` | Fetch TMS, SMMS, and TDMS maintenance demands |
| `POST` | `/api/demands` | Ingest new corridor block demand with trust fusion |
| `PUT` | `/api/demands/{id}` | Update demand status across 5-stage lifecycle |
| `DELETE` | `/api/demands/{id}` | Withdraw corridor demand |
| `POST` | `/api/solver/solve` | Run Google OR-Tools CP-SAT corridor arbitration |
| `GET` | `/api/solver/stream` | Server-Sent Events (SSE) streaming solver telemetry |
| `POST` | `/api/t409/generate` | Issue official Indian Railways Form T/409 Certificate |
| `GET` | `/api/t409/ledger` | RDSO-compliant immutable compliance audit ledger |
