# LeadForgeAI - Current Project Status & Architecture Report

**Last Updated:** August 3, 2026  
**Repository:** `devlinuskibet/LeadForgeAI`  
**Live Production Deployments:**  
- **Backend API (Azure App Service):** `https://leadforge-backend-api-cnb0hge5cyfpgwc7.uaenorth-01.azurewebsites.net`
- **Frontend SPA (Vercel):** `https://lead-forge-f6suwo1p4-linus-projects-067e6727.vercel.app`

---

## 🚀 Live System Capabilities & Feature Status

### 1. 🔍 Autonomous Prospect Discovery Agent (`/discovery`)
- **Real-World Places Search**: Connects live to Google Places API (`https://places.googleapis.com/v1/places:searchText`) when `GOOGLE_PLACES_API_KEY` is present.
- **Dynamic Result Count & Presets**: Supports custom numeric input (`1–100`) and quick preset buttons (`5`, `10`, `25`, `50`).
- **Live Search Telemetry**: Real-time step-by-step progress logging (*Google Search $\rightarrow$ Website Extraction $\rightarrow$ Prospect Analysis*).

### 2. 💰 Modular Localized B2B Valuation Engine (`ValuationService`)
- **Externalized Pricing Profile (`config/pricing_profiles.json`)**: Configurable market profiles (defaults to **Kenyan Shillings - KES / KSh**).
- **Location Tier Multipliers**:
  - **Tier 1 (Metro Hubs)**: *Nairobi CBD / Westlands / Kilimani / Nyali* $\rightarrow$ **1.5x Multiplier**
  - **Tier 2 (Regional Hubs)**: *Nakuru / Eldoret / Kisumu / Thika / Kiambu* $\rightarrow$ **1.1x Multiplier**
  - **Tier 3 (Townships)**: *Bomet / Kericho / Nyeri / Machakos / Kitale* $\rightarrow$ **0.85x Multiplier**
- **Category Base Pricing**: High-value B2B/Hospitals (KES 150k), Mid-tier (KES 85k), Local trades (KES 35k).
- **Digital Footprint Gap Matrix**: Evaluates missing websites or low review counts to attach solution packages (*WhatsApp Intake Bot*, *Google Review Booster*, *LeadForge AI CRM*).

### 3. 🤖 AI Sales Intelligence & Executive Copilot (`AIService` & `GeminiProvider`)
- **Multi-Model Fallback Engine**: Tries `gemini-2.0-flash`, `gemini-1.5-flash`, and `gemini-1.5-pro` automatically.
- **3-Paragraph Personalized Email Prompting**: Generates tailored outreach incorporating prospect name, location, inferred operational bottlenecks, and KES package pricing.
- **Company Dossier & Online Reputation Tab**: Displays Google review star rating (e.g. 4.6 ★), workforce size estimates (50–250 employees), and public sentiment summary.

### 4. ✉️ Full Interactive Email Copilot & Editor (`PreviewEmailModal.tsx`)
- **Editable Email Attributes**: Full freedom to edit Recipient (`To`), Subject Line, and Email Body.
- **URL Auto-Cleaner**: Automatically converts website URLs (e.g. `http://tenwekhospital.org`) into valid email addresses (`contact@tenwekhospital.org`).
- **Live Delivery Engine**: Supports **Save Draft** and live **Send Email Now** integration via SendGrid or SMTP (`/api/emails/{id}/send`).

### 5. 💾 Database Persistence & Azure App Service Binding
- **Persistent Storage Path**: Configured SQLite to mount at `/home/leadforge.db` in Azure App Service so discovered leads, company analyses, and email drafts persist across container reboots and page refreshes.
- **Port Binding**: Bound Uvicorn dynamically on port `8000` (`WEBSITES_PORT=8000`).

---

## 📊 Automated Test Suite & Code Quality Metrics

- **Backend Pytest Suite**: 34/34 Unit Tests PASSED (100% pass rate).
- **Frontend Build**: Vite + TypeScript Production Build PASSED in 1.59s with 0 errors.

---

## 🛠️ Active Environment Variables (Azure & Vercel)

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Vercel | Points frontend to Azure backend URL |
| `GOOGLE_PLACES_API_KEY` | Azure | Google Places API (New) key for live business queries |
| `GEMINI_API_KEY` | Azure | Google Gemini Flash key for AI analysis and email drafting |
| `SENDGRID_API_KEY` | Azure | SendGrid API key for live cold outreach delivery |
| `DEFAULT_SENDER_EMAIL` | Azure | Verified sender email address |
| `DATABASE_URL` | Azure | Database connection string (SQLite `/home/leadforge.db`) |
