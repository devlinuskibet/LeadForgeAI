# LeadForgeAI 🚀

LeadForgeAI is an enterprise-grade, autonomous AI-powered B2B prospecting, company discovery, and automated email outreach orchestration platform.

## Key Features

- **Google Places Autonomous Discovery**: Discover local businesses with location data, rating criteria, and automatic website analysis.
- **AI Sales Coach Strategy**: Inferred operational bottlenecks, custom solution package recommendations, and one-click outreach email drafting.
- **Storyteller Lead Journey**: Visual step-by-step pipeline tracking (`Discovered` → `Analyzed` → `Draft Ready` → `Sent` → `Won`).
- **Deals & Revenue Intelligence**: Weighted deal opportunity valuation, win rate metrics, and AI proposal package generator.
- **Glassmorphic Modern UI**: Glassmorphic search bars, filter chips, dark telemetry terminal, and vibrant gradient statistics cards.
- **Security & Observability**: Real-time service uptime checks, IP-based rate limiting, security headers, and structured audit logging.

## Backend Architecture

Built with **FastAPI**, **SQLAlchemy**, **Pydantic v2**, and **Alembic**.

### API Routes & Utilities

- `GET /api/health` - System health check, database connectivity, and uptime.
- `GET /api/export/companies/csv` - Export company records as CSV.
- `GET /api/export/contacts/csv` - Export contact records as CSV.
- `POST /api/contacts/batch` - Bulk creation of contact records.
- `POST /api/discovery/search` - Discovery search provider endpoint.
- `POST /api/emails/generate` - AI email generation & tracking.

### Core Utilities & Middleware

- `RateLimiterMiddleware` (`backend/core/rate_limiter.py`): In-memory token bucket rate limiter.
- `SecurityHeadersMiddleware` (`backend/core/middleware.py`): Enforces secure response headers.
- `AuditLogger` (`backend/utils/audit.py`): Formats and records structured audit events.
- `PaginationParams` & `PaginatedResponse` (`backend/utils/pagination.py`): Reusable pagination helpers.
- `APIEnvelope` (`backend/utils/response.py`): Standard JSON response envelope (`success`, `data`, `error_code`, `timestamp`).
- `EmailTemplateService` (`backend/services/email_template_service.py`): Dynamic placeholder substitution engine.
- `SearchFilterBuilder` (`backend/utils/search_filter.py`): Dynamic multi-column SQL search query builder.

## Testing & Quality Assurance

Run the complete test suite using the standalone test runner script:

```bash
python scripts/run_all_tests.py
```

Or using Python's native `unittest` framework:

```bash
$env:PYTHONPATH="backend"
python -m unittest discover -s backend/tests
```

Or with `pytest`:

```bash
pytest backend/tests
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
4. Start FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
5. Start Celery Worker (Optional background worker for asynchronous jobs):
   ```bash
   python -m celery -A workers.tasks worker --loglevel=info -P solo
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

---
*LeadForgeAI platform codebase maintained and updated.*
