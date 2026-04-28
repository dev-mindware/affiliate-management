# 🚀 Mindware Affiliate Management System (API)

A robust, enterprise-grade affiliate management system tailored for the Angolan market. This system handles affiliate registration, lead tracking, commission calculation, and automated payouts with high security and performance.

---

## 🏗 Architecture & Technology Stack

The project follows a modern, asynchronous architecture designed for scalability and reliability.

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.13)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Async)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Background Tasks**: [Celery](https://docs.celeryq.dev/) with [Redis](https://redis.io/)
- **Security**: 
  - JWT Authentication (Access + Refresh tokens)
  - Rate Limiting (via `slowapi`)
  - CSRF/CORS Protection
  - Structured Logging (`loguru`)
- **Storage**: Cloudflare R2 (S3-Compatible) for document storage

---

## 📁 Project Structure

```text
├── app/
│   ├── models/       # SQLAlchemy database models
│   ├── schemas/      # Pydantic schemas (Validation & Serialization)
│   ├── routers/      # API endpoints (versioned v1)
│   ├── services/     # Business logic layer
│   ├── integrations/ # External API clients (S3, Mail, etc.)
│   ├── tasks/        # Celery background tasks
│   ├── main.py       # Application entry point
│   ├── config.py     # Environment settings & Pydantic-Settings
│   └── database.py   # Async session & DB engine setup
├── migrations/       # Alembic migration scripts
├── scripts/          # Utility scripts (Seeding, setup)
├── tests/            # Pytest test suite
├── logs/             # Application logs (Auto-generated)
├── Dockerfile        # Production-ready Docker config
└── docker-compose.yml# Local infrastructure orchestrator
```

---

## 🛠 Getting Started

### 1. Prerequisites
- Python 3.13+
- Docker & Docker Compose
- Virtualenv (`python -m venv .venv`)

### 2. Environment Setup
Create a `.env` file based on the template:
```bash
cp .env.example .env
```
*Note: Ensure `POSTGRES_PORT` matches your local available ports (Default: 5435).*

### 3. Launch Infrastructure
Start PostgreSQL and Redis:
```bash
docker compose up -d
```

### 4. Install Dependencies
```bash
# Windows
.venv\Scripts\pip install -r requirements.txt
# Unix
source .venv/bin/activate && pip install -r requirements.txt
```

### 5. Database Setup
Apply migrations and seed initial data (Admin user and core services):
```bash
alembic upgrade head
python scripts/seed.py
```

### 6. Run the Application
```bash
uvicorn app.main:app --reload
```

---

## 🛡 Security Features

- **Rate Limiting**: Critical endpoints (Login/Register) are limited to **5 requests/minute** to prevent brute-force.
- **Structured Logging**: All logs are captured in `logs/app.log` with a unique request-id trace.
- **Data Integrity**: Uses Pydantic for strict input validation and type safety.

---

## 📚 API Documentation

Once the server is running, explore the interactive documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Testing

Run the test suite with coverage:
```bash
pytest --cov=app tests/
```

---

## 📞 Support
Developed for **Mindware Angola**. Contact the dev team for architectural questions.