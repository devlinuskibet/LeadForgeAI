# LeadForgeAI

LeadForgeAI is an enterprise-grade AI-powered B2B prospecting, company discovery, and automated email outreach orchestration platform.

## Key Features

- **Automated Prospecting & Discovery**: Discover target companies and key decision-maker contacts with enrichment data.
- **AI Outreach Copilot**: Generates personalized email templates and discovery insights backed by LLMs.
- **CSV Data Export**: Export company and contact datasets seamlessly via dedicated REST endpoints.
- **Bulk Data Import**: High-performance batch endpoints for contact and company creation.
- **Security & Observability**: Real-time service uptime checks, IP-based rate limiting, security headers, and structured audit logging.
- **Dynamic Template Engine**: Email placeholder variable rendering with fallback defaults.
- **Email Delivery Event Webhooks**: Ingest real-time delivery, open, reply, and bounce events with live timeline updates.
- **Frontend UI Architecture**: Modern React + TypeScript application with reusable components (`LoadingSpinner`, `ErrorBoundary`, `NotificationToast`, `ExportDataModal`) and custom hooks (`useFetch`, `useLocalStorage`).

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
   uvicorn main:app --reload
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
