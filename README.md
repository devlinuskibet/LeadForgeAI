# LeadForgeAI

LeadForgeAI is an enterprise-grade AI-powered B2B prospecting, company discovery, and automated email outreach orchestration platform.

## Features

- **Automated Prospecting & Discovery**: Discover target companies and key decision-maker contacts with enrichment data.
- **AI Outreach Copilot**: Generates personalized email templates and discovery insights backed by LLMs.
- **CSV Data Export**: Export company and contact datasets seamlessly via dedicated REST endpoints.
- **Bulk Data Import**: High-performance batch endpoints for contact and company creation.
- **System Health & Observability**: Real-time service uptime, database check, and security middleware headers.
- **Frontend App**: Modern React TypeScript web application powered by Vite.

## Backend Architecture

Built with **FastAPI**, **SQLAlchemy**, and **Alembic**.

### API Routes Overview

- `GET /api/health` - System health check, database status, and uptime.
- `GET /api/export/companies/csv` - Export company records as CSV.
- `GET /api/export/contacts/csv` - Export contact records as CSV.
- `POST /api/contacts/batch` - Bulk creation of contact records.
- `POST /api/discovery/search` - Discovery search provider endpoint.
- `POST /api/emails/generate` - AI email generation & tracking.

## Testing & Quality Assurance

Run the automated test suite using Python's native `unittest` framework:

```bash
$env:PYTHONPATH="backend"
python -m unittest discover -s backend/tests
```

Or with `pytest` inside the virtual environment:

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
