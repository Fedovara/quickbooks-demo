# Product Requirements Document
# QuickBooks AI Outstanding Invoice Analyzer

**Version:** 1.0  
**Date:** 2026-06-14  
**Status:** Final — Ready for Engineering  
**Author:** Product & Architecture Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [User Personas](#3-user-personas)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Database Design](#7-database-design)
8. [API Design](#8-api-design)
9. [Security Design](#9-security-design)
10. [UX Flow](#10-ux-flow)
11. [Roadmap](#11-roadmap)
12. [Success Metrics](#12-success-metrics)
13. [Development Phases](#13-development-phases)

---

## 1. Executive Summary

**QuickBooks AI Outstanding Invoice Analyzer** is a cloud-based SaaS application that connects to a user's QuickBooks Online account via OAuth 2.0 and transforms raw accounting data into actionable financial intelligence.

The product solves a concrete business pain: business owners and accountants struggle to quickly understand which invoices are outstanding, which customers are at collection risk, and what actions to prioritize. QuickBooks itself provides this data but buries it behind complex workflows. This product surfaces it in seconds.

**Core Value Proposition:**  
Connect QuickBooks → Generate outstanding invoice report → Receive AI-powered collection insights → Export to Excel or PDF — all in under 60 seconds.

**MVP Target:** Deployable on Vercel within 4–6 weeks of development by a small engineering team (2–3 engineers).

**Monetization Path (post-MVP):** Freemium SaaS with per-seat or per-company pricing. MVP is demo-ready for client acquisition.

---

## 2. Product Vision

### 2.1 Problem Statement

Businesses accumulate unpaid invoices without a clear picture of:

- Total money owed to them at any given moment
- Which customers consistently pay late or not at all
- Which invoices are approaching or past due
- Where to focus collection effort for maximum cash recovery
- Executive-level summaries they can share with stakeholders

QuickBooks Online stores all this data but requires navigating multiple screens, applying filters manually, and exporting raw data that still requires interpretation. Finance teams waste hours per week producing reports that could be automated.

### 2.2 Solution

A single-purpose SaaS application that:

1. Authenticates users securely
2. Connects to their QuickBooks company via OAuth
3. Pulls outstanding invoice data on demand
4. Applies date-range filters and aging calculations
5. Presents a clean, sortable, filterable dashboard
6. Generates AI-written financial insights in plain English
7. Exports polished Excel and PDF reports

### 2.3 Long-Term Vision

Evolve into an **AI-powered financial copilot** for small and medium businesses — starting with QuickBooks AR analysis and expanding to multi-platform coverage (Xero, Stripe, Shopify, HubSpot) with conversational AI and autonomous collection workflows.

---

## 3. User Personas

### Persona 1 — Maria, Small Business Owner

- **Role:** Owner of a 12-person marketing agency
- **Age:** 42
- **Tech Comfort:** Medium. Uses QuickBooks but relies on bookkeeper for reports.
- **Pain Points:**
  - Does not know which clients owe money without asking her bookkeeper
  - Worries about cash flow at month-end
  - Needs a quick answer before a client call
- **Goals:**
  - Instant view of outstanding invoices
  - Know who to chase before payroll week
  - Professional PDF to share with her business partner
- **Success Metric:** Gets outstanding invoice summary in under 2 minutes without bookkeeper help

---

### Persona 2 — James, Bookkeeper / Accountant

- **Role:** Bookkeeper managing 8 client companies
- **Age:** 35
- **Tech Comfort:** High. Power user of QuickBooks and Excel.
- **Pain Points:**
  - Produces AR aging reports manually each week for multiple clients
  - Formatting Excel exports from QuickBooks is time-consuming
  - Clients ask for summaries he has to write by hand
- **Goals:**
  - Automate weekly AR report generation across clients
  - Export clean, branded Excel files
  - Have AI write the executive summary he previously wrote manually
- **Success Metric:** Reduces AR reporting time from 2 hours/week to 15 minutes

---

### Persona 3 — Sarah, Fractional CFO

- **Role:** Fractional CFO for 4 SMB clients
- **Age:** 49
- **Tech Comfort:** High. Spreadsheet-native, data-driven.
- **Pain Points:**
  - Needs collection risk assessment to advise clients on cash flow
  - Current tools give data but not prioritized action
  - Board presentations require executive summaries
- **Goals:**
  - AI-generated risk assessment she can present directly
  - Identify top 5 collection priorities per client per month
  - PDF report she can attach to board deck
- **Success Metric:** AI insights save 1 hour of analysis per client per month

---

### Persona 4 — Carlos, Finance Team Member (Mid-Market)

- **Role:** Accounts Receivable Specialist at 50-person company
- **Age:** 29
- **Tech Comfort:** Medium-High. Uses QuickBooks and internal systems daily.
- **Pain Points:**
  - Generates AR aging reports on fixed schedule, not on demand
  - Cannot quickly answer ad-hoc questions from management
  - Reports take 30 minutes to prepare and format
- **Goals:**
  - On-demand report generation
  - Filter by date range quickly
  - Share report with manager via email attachment
- **Success Metric:** Can produce and send a formatted AR report in under 5 minutes

---

## 4. Functional Requirements

### 4.1 Authentication Module

#### FR-AUTH-001: User Registration
- User can register with email and password
- Email must be validated for format
- Password minimum 8 characters, at least 1 uppercase, 1 number
- Confirmation email sent via Supabase Auth
- Duplicate email returns clear error message

#### FR-AUTH-002: User Login
- User can login with email and password
- Failed login shows generic error (no username enumeration)
- Successful login redirects to `/dashboard`
- Session persisted via Supabase JWT

#### FR-AUTH-003: Password Reset
- "Forgot Password" link on login page
- User enters email; reset link sent via Supabase Auth
- Reset link expires in 1 hour
- New password must meet same complexity requirements

#### FR-AUTH-004: Session Management
- Session expires after 24 hours of inactivity
- User can manually log out
- Logout clears all local session state

---

### 4.2 QuickBooks Connection Module

#### FR-QB-001: Connect QuickBooks Account
- User navigates to Settings → Connect QuickBooks
- Application initiates OAuth 2.0 Authorization Code flow with QuickBooks
- User authenticates with QuickBooks credentials on Intuit's OAuth server
- On success, access token and refresh token stored encrypted in database
- Company name and Realm ID stored for display and API calls
- Connection status shown on Settings page and Dashboard header

#### FR-QB-002: Disconnect QuickBooks Account
- User can disconnect from Settings page
- On disconnect: tokens deleted from database, connection status cleared
- Disconnecting does not delete report history
- Confirmation modal before disconnect

#### FR-QB-003: Token Refresh
- Access tokens expire every 60 minutes (QuickBooks standard)
- Application automatically refreshes token before API calls if expiry < 5 minutes away
- Refresh token expires after 100 days; user notified to re-connect when this occurs
- Token refresh failures handled gracefully with user notification

#### FR-QB-004: Connection Status Indicator
- Dashboard shows green/red indicator for QuickBooks connection status
- If disconnected, prominent CTA to reconnect

---

### 4.3 Outstanding Invoice Report

#### FR-RPT-001: Date Range Selection
- User selects Start Date and End Date via date picker
- Default range: last 90 days
- Date pickers prevent End Date before Start Date
- Maximum date range: 2 years

#### FR-RPT-002: Generate Report
- "Generate Report" button triggers API call to QuickBooks
- Loading state shown during data fetch (skeleton loader)
- On success, report table populated
- On failure, error message shown with retry option
- Report generation time target: < 5 seconds for up to 500 invoices

#### FR-RPT-003: Invoice Table Display
The report table must show the following columns:

| Column | Source | Calculated |
|--------|--------|------------|
| Invoice Number | QB Invoice.DocNumber | No |
| Customer Name | QB Customer.DisplayName | No |
| Invoice Date | QB Invoice.TxnDate | No |
| Due Date | QB Invoice.DueDate | No |
| Total Amount | QB Invoice.TotalAmt | No |
| Outstanding Balance | QB Invoice.Balance | No |
| Days Overdue | Today − DueDate (if DueDate < Today) | Yes |
| Status | Derived from Balance and DueDate | Yes |

Status values:
- `Current` — balance > 0, due date in future
- `Due Today` — balance > 0, due date = today
- `Overdue` — balance > 0, due date in past
- `Paid` — balance = 0 (excluded from default view)

#### FR-RPT-004: Table Interactions
- Column sorting (click header to sort ascending/descending)
- Client-side search/filter by customer name
- Status filter dropdown (All / Current / Due Today / Overdue)
- Pagination: 25 rows per page, with page navigation
- Row count shown: "Showing 25 of 143 invoices"

#### FR-RPT-005: Report Persistence
- Generated report stored in `report_history` table
- User can view last 10 generated reports from Reports page
- Re-loading a saved report does not trigger new QuickBooks API call

---

### 4.4 Dashboard Metrics

#### FR-DASH-001: KPI Cards
The dashboard must display the following metric cards:

| Metric | Definition |
|--------|-----------|
| Total Outstanding Balance | Sum of Balance across all outstanding invoices in current report |
| Total Outstanding Invoices | Count of invoices with Balance > 0 |
| Overdue Invoices | Count of invoices where DueDate < Today and Balance > 0 |
| Largest Debtor | Customer name with highest total outstanding Balance |
| Average Days Outstanding | Mean of (Today − InvoiceDate) for outstanding invoices |

#### FR-DASH-002: KPI Card Formatting
- Currency values formatted with locale-aware currency symbol (default: USD)
- Numbers formatted with thousand separators
- Cards include trend indicator (up/down arrow) if previous report exists for comparison

#### FR-DASH-003: Dashboard State
- Empty state shown if no QuickBooks connection exists
- Empty state shown if no report has been generated yet
- Last report generation timestamp shown: "Last updated: June 14, 2026 at 14:32"

---

### 4.5 Export Features

#### FR-EXP-001: Excel Export
- "Export Excel" button on Reports page
- Generates `.xlsx` file using ExcelJS
- File includes:
  - Sheet 1: "Summary" — KPI metrics table
  - Sheet 2: "Invoice Detail" — full invoice table with all columns
  - Column headers bold, auto-width
  - Overdue rows highlighted in light red (#FFCCCC)
  - Current rows in light green (#CCFFCC)
  - Company name and report date range in header row
- File named: `AR_Report_YYYY-MM-DD.xlsx`
- Download triggered client-side

#### FR-EXP-002: PDF Export
- "Export PDF" button on Reports page
- Generates `.pdf` file using pdf-lib
- PDF includes:
  - Header: Company name, report date range, generation date
  - KPI summary section
  - Invoice detail table (paginated across multiple pages if needed)
  - Footer: page numbers, application name
  - Professional financial report styling (clean, black and white compatible)
- File named: `AR_Report_YYYY-MM-DD.pdf`
- Download triggered client-side

---

### 4.6 AI Insights Module

#### FR-AI-001: AI Analysis Trigger
- "Generate AI Insights" button on Reports page (available after report generated)
- Sends structured invoice data to AI provider
- Loading state with animated indicator (AI analysis typically 5–15 seconds)
- AI insights displayed in dedicated section below report table

#### FR-AI-002: AI Insights Content
The AI must generate the following sections:

**Section 1: Executive Summary**
- 2–3 paragraph professional summary of outstanding invoice situation
- Total exposure, number of customers, urgency level

**Section 2: Highest-Risk Customers**
- Ranked list of top 5 customers by outstanding balance and days overdue
- For each: customer name, total owed, longest overdue invoice, risk assessment (Low / Medium / High)

**Section 3: Overdue Invoice Analysis**
- Breakdown by aging bucket:
  - 1–30 days overdue
  - 31–60 days overdue
  - 61–90 days overdue
  - 90+ days overdue
- Total balance and count per bucket
- Commentary on aging distribution

**Section 4: Collection Priority Recommendations**
- Numbered action list: top 5 specific recommended actions
- Each recommendation includes customer name, amount, and suggested approach
- Professional, actionable language ("Contact [Customer] regarding Invoice #[X] for $[Y] which is [Z] days overdue")

**Section 5: Cash Flow Outlook**
- Estimated recoverable amount in next 30 days (based on due dates)
- Estimated at-risk amount (invoices 60+ days overdue)
- Brief cash flow commentary

#### FR-AI-003: AI Provider Configuration
- Default provider: OpenRouter with model `anthropic/claude-sonnet-4-6` or `openai/gpt-4o`
- Fallback provider: Groq with model `llama-3.3-70b-versatile`
- Provider and model configurable via environment variables: `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`
- System prompt enforces professional financial tone
- Invoice data sent as structured JSON in user message
- Maximum context: truncate to 200 invoices if more exist (send summary statistics instead for remainder)

#### FR-AI-004: AI Insights Display
- Insights displayed in card layout with section headings
- Copy-to-clipboard button for full insights text
- "Regenerate" button to re-run analysis
- Timestamp shown: "Generated at 14:35:22"
- AI insights stored alongside report in `report_history` table

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Target |
|--------|--------|
| Page load (initial, cached) | < 1.5 seconds (LCP) |
| Report generation (< 100 invoices) | < 3 seconds |
| Report generation (100–500 invoices) | < 8 seconds |
| Excel export generation | < 2 seconds |
| PDF export generation | < 3 seconds |
| AI insights generation | < 20 seconds |
| Dashboard KPI card render | < 500ms after report load |

### 5.2 Scalability

- MVP: Support up to 100 concurrent users
- Database: Supabase free tier sufficient for MVP (500MB, 50MB file storage)
- Vercel Fluid Compute handles burst traffic without configuration
- QuickBooks API rate limits: 500 requests/minute/company — implement request queuing if batching needed

### 5.3 Reliability

- Application uptime target: 99.5% (Vercel SLA)
- QuickBooks API failures handled gracefully with user-facing error messages
- AI provider failure falls back to secondary provider automatically
- No data loss on token refresh failures (user notified to reconnect)

### 5.4 Compatibility

- Browsers: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Mobile: Responsive layout down to 375px viewport width
- OS: Windows, macOS, iOS, Android (browser-based only, no native app)
- Excel exports compatible with Microsoft Excel 2016+ and Google Sheets
- PDF exports compatible with all modern PDF viewers

### 5.5 Accessibility

- WCAG 2.1 AA compliance target
- All interactive elements keyboard-navigable
- Color is not the sole means of conveying status (icons + labels alongside color)
- Screen reader compatible labels on all form inputs

---

## 6. Technical Architecture

### 6.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                          │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   Next.js App   │    │      Next.js API Routes       │   │
│  │   (App Router)  │    │   /api/auth/callback          │   │
│  │                 │    │   /api/quickbooks/*            │   │
│  │  - Landing Page │    │   /api/reports/*               │   │
│  │  - Dashboard    │    │   /api/ai/*                    │   │
│  │  - Reports      │    │   /api/export/*                │   │
│  │  - AI Insights  │    └──────────────────────────────┘   │
│  │  - Settings     │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌────────────────┐        ┌────────────────────┐
│   Supabase     │        │   External APIs    │
│                │        │                    │
│  - Auth        │        │  - QuickBooks API  │
│  - PostgreSQL  │        │  - OpenRouter API  │
│  - RLS         │        │  - Groq API        │
└────────────────┘        └────────────────────┘
```

### 6.2 Frontend Architecture

**Framework:** Next.js 15 (App Router)  
**Language:** TypeScript (strict mode)  
**Styling:** TailwindCSS v4  
**Component Library:** shadcn/ui  
**State Management:** React Server Components + minimal client state (useState/useReducer)  
**Data Fetching:** Server Actions for mutations, Server Components for data reads  
**Forms:** react-hook-form + zod validation  

**Directory Structure:**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Authenticated layout with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── ai-insights/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts
│   │   ├── quickbooks/
│   │   │   ├── connect/route.ts
│   │   │   ├── callback/route.ts
│   │   │   ├── disconnect/route.ts
│   │   │   └── invoices/route.ts
│   │   ├── reports/
│   │   │   ├── generate/route.ts
│   │   │   └── history/route.ts
│   │   ├── ai/
│   │   │   └── analyze/route.ts
│   │   └── export/
│   │       ├── excel/route.ts
│   │       └── pdf/route.ts
│   ├── layout.tsx
│   └── page.tsx                    # Landing page
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── MetricsGrid.tsx
│   │   └── ConnectionStatus.tsx
│   ├── reports/
│   │   ├── InvoiceTable.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ReportControls.tsx
│   ├── ai/
│   │   └── InsightsPanel.tsx
│   └── shared/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── LoadingSkeleton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client
│   ├── quickbooks/
│   │   ├── oauth.ts                # OAuth flow helpers
│   │   ├── client.ts               # QB API wrapper
│   │   └── types.ts                # QB data types
│   ├── ai/
│   │   ├── client.ts               # AI provider client
│   │   └── prompts.ts              # System prompts
│   ├── export/
│   │   ├── excel.ts                # ExcelJS logic
│   │   └── pdf.ts                  # pdf-lib logic
│   └── utils/
│       ├── currency.ts
│       ├── dates.ts
│       └── invoice-calculations.ts
├── actions/
│   ├── auth.ts                     # Server Actions: login, register, etc.
│   ├── quickbooks.ts               # Server Actions: connect, disconnect
│   └── reports.ts                  # Server Actions: generate report
└── types/
    ├── database.ts                 # Supabase generated types
    ├── invoice.ts
    └── report.ts
```

### 6.3 Backend Architecture

All backend logic runs within Next.js API Routes and Server Actions on Vercel Fluid Compute (Node.js 24 LTS).

**API Route responsibilities:**
- `POST /api/quickbooks/invoices` — fetch and normalize QB invoice data
- `POST /api/reports/generate` — persist report to database
- `POST /api/ai/analyze` — send invoice data to AI provider, stream response
- `GET /api/export/excel` — generate and stream Excel file
- `GET /api/export/pdf` — generate and stream PDF file
- `GET/POST /api/auth/callback` — Supabase Auth callback
- `GET /api/quickbooks/connect` — initiate QB OAuth flow
- `GET /api/quickbooks/callback` — handle QB OAuth callback

**Server Actions responsibilities:**
- User authentication (login, register, logout, password reset)
- QuickBooks token management
- Report history retrieval

### 6.4 QuickBooks Integration

**OAuth 2.0 Flow:**
1. User clicks "Connect QuickBooks"
2. App generates state parameter (CSRF protection), stores in session
3. Redirect to `https://appcenter.intuit.com/connect/oauth2` with:
   - `client_id`
   - `redirect_uri` = `{APP_URL}/api/quickbooks/callback`
   - `scope` = `com.intuit.quickbooks.accounting`
   - `response_type` = `code`
   - `state` = CSRF token
4. QuickBooks redirects back with `code` and `realmId`
5. App exchanges code for access + refresh tokens via POST to `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`
6. Tokens encrypted and stored in `quickbooks_connections` table

**API Base URL (Production):** `https://quickbooks.api.intuit.com/v3/company/{realmId}`

**Invoice Query (QuickBooks Query Language):**
```sql
SELECT * FROM Invoice 
WHERE Balance > '0' 
AND TxnDate >= '{startDate}' 
AND TxnDate <= '{endDate}'
MAXRESULTS 1000
```

**Token Refresh:**
- Check token expiry before each API call
- If expires within 5 minutes, POST to token endpoint with `grant_type=refresh_token`
- Update stored tokens in database
- If refresh token expired (> 100 days), mark connection as expired, notify user

### 6.5 AI Integration

**Provider Priority:**
1. Primary: OpenRouter (`https://openrouter.ai/api/v1`) — OpenAI-compatible API
2. Fallback: Groq (`https://api.groq.com/openai/v1`) — OpenAI-compatible API

**Request Structure:**
```typescript
const messages = [
  {
    role: "system",
    content: FINANCIAL_ANALYSIS_SYSTEM_PROMPT  // See lib/ai/prompts.ts
  },
  {
    role: "user", 
    content: JSON.stringify({
      reportDateRange: { start, end },
      summary: { totalOutstanding, invoiceCount, overdueCount },
      invoices: normalizedInvoiceArray,  // Max 200 items
      generatedAt: new Date().toISOString()
    })
  }
]
```

**System Prompt (in `lib/ai/prompts.ts`):**
```
You are a senior financial analyst specializing in accounts receivable management.
Analyze the provided outstanding invoice data and generate a professional financial report.
Your analysis must be accurate, specific, and actionable.
Use the customer names, amounts, and dates from the data.
Output must be structured as JSON with the following sections:
executiveSummary, highRiskCustomers, overdueAnalysis, collectionPriorities, cashFlowOutlook.
Be specific with numbers. Round currency to 2 decimal places. Use professional business language.
```

**Response Handling:**
- Parse JSON response from AI
- Validate structure with Zod schema
- Render sections individually in `InsightsPanel.tsx`
- Store raw AI response JSON in `report_history.ai_insights` column

---

## 7. Database Design

### 7.1 Entity Relationship Diagram

```
users (Supabase Auth)
  │
  ├──< quickbooks_connections (1:1 per user per company)
  │
  └──< reports (1:many)
       │
       └──< report_invoices (1:many — cached invoice line items)
```

### 7.2 Table Definitions

#### Table: `profiles`
Extends Supabase Auth `auth.users` with application-level data.

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  company_name  TEXT,
  timezone      TEXT DEFAULT 'UTC',
  currency_code TEXT DEFAULT 'USD',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

#### Table: `quickbooks_connections`

```sql
CREATE TABLE quickbooks_connections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  realm_id            TEXT NOT NULL,
  company_name        TEXT NOT NULL,
  access_token        TEXT NOT NULL,          -- encrypted with pgcrypto
  refresh_token       TEXT NOT NULL,          -- encrypted with pgcrypto
  access_token_expiry TIMESTAMPTZ NOT NULL,
  refresh_token_expiry TIMESTAMPTZ NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  connected_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at      TIMESTAMPTZ,
  disconnected_at     TIMESTAMPTZ,
  UNIQUE(user_id, realm_id)
);

CREATE INDEX idx_qb_connections_user_id ON quickbooks_connections(user_id);
CREATE INDEX idx_qb_connections_active ON quickbooks_connections(user_id, is_active);
```

**Notes:**
- `access_token` and `refresh_token` stored encrypted using `pgp_sym_encrypt()` with application-level key
- Only one active connection per user per realm (company)
- `is_active = false` on disconnect (soft delete, preserves history)

---

#### Table: `reports`

```sql
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id   UUID REFERENCES quickbooks_connections(id),
  date_from       DATE NOT NULL,
  date_to         DATE NOT NULL,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Cached summary metrics
  total_outstanding   NUMERIC(15,2),
  invoice_count       INTEGER,
  overdue_count       INTEGER,
  largest_debtor_name TEXT,
  largest_debtor_amount NUMERIC(15,2),
  avg_days_outstanding NUMERIC(8,2),
  
  -- AI output
  ai_insights         JSONB,
  ai_generated_at     TIMESTAMPTZ,
  
  -- Status
  status          TEXT NOT NULL DEFAULT 'completed' 
                  CHECK (status IN ('generating', 'completed', 'failed')),
  error_message   TEXT
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_user_generated ON reports(user_id, generated_at DESC);
```

---

#### Table: `report_invoices`
Cached invoice line items per report (avoids repeated QB API calls for exports/AI).

```sql
CREATE TABLE report_invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id         UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- QuickBooks identifiers
  qb_invoice_id     TEXT NOT NULL,
  invoice_number    TEXT NOT NULL,
  
  -- Customer
  customer_id       TEXT NOT NULL,
  customer_name     TEXT NOT NULL,
  
  -- Amounts
  total_amount      NUMERIC(15,2) NOT NULL,
  outstanding_balance NUMERIC(15,2) NOT NULL,
  
  -- Dates
  invoice_date      DATE NOT NULL,
  due_date          DATE,
  
  -- Calculated at report generation time
  days_overdue      INTEGER,
  status            TEXT NOT NULL 
                    CHECK (status IN ('current', 'due_today', 'overdue', 'paid')),
  
  -- Metadata
  currency_code     TEXT DEFAULT 'USD'
);

CREATE INDEX idx_report_invoices_report_id ON report_invoices(report_id);
CREATE INDEX idx_report_invoices_customer ON report_invoices(report_id, customer_name);
CREATE INDEX idx_report_invoices_status ON report_invoices(report_id, status);
```

---

#### Table: `audit_logs`

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  metadata    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
```

**Logged actions:** `user.login`, `user.logout`, `qb.connected`, `qb.disconnected`, `report.generated`, `export.excel`, `export.pdf`, `ai.analyzed`

---

### 7.3 Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quickbooks_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_invoices ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- QuickBooks connections: user-scoped
CREATE POLICY "Users can manage own QB connections" ON quickbooks_connections
  FOR ALL USING (auth.uid() = user_id);

-- Reports: user-scoped
CREATE POLICY "Users can manage own reports" ON reports
  FOR ALL USING (auth.uid() = user_id);

-- Report invoices: via report ownership
CREATE POLICY "Users can view own report invoices" ON report_invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = report_invoices.report_id 
      AND reports.user_id = auth.uid()
    )
  );
```

---

## 8. API Design

### 8.1 Authentication Endpoints

These are handled by Supabase Auth and Next.js Server Actions. Direct API routes wrap Supabase calls.

#### `POST /api/auth/callback`
Supabase Auth callback — handled automatically by `@supabase/ssr`.

---

### 8.2 QuickBooks Endpoints

#### `GET /api/quickbooks/connect`
Initiates the QuickBooks OAuth flow.

**Request:** Authenticated. No body.

**Response:** `302 Redirect` to QuickBooks authorization URL.

**Authorization URL params:**
```
client_id=QB_CLIENT_ID
redirect_uri=APP_URL/api/quickbooks/callback
scope=com.intuit.quickbooks.accounting
response_type=code
state={CSRF_TOKEN}
```

---

#### `GET /api/quickbooks/callback`
Handles OAuth callback from QuickBooks.

**Request:** Authenticated. Query params: `code`, `realmId`, `state`.

**Process:**
1. Validate `state` matches stored CSRF token
2. Exchange `code` for tokens via Intuit token endpoint
3. Fetch company name from QB API
4. Encrypt and store tokens in `quickbooks_connections`
5. Log audit event `qb.connected`
6. Redirect to `/settings?connected=true`

**Error Response:** `302 /settings?error=qb_connection_failed`

---

#### `DELETE /api/quickbooks/disconnect`
Disconnects the QuickBooks account.

**Request:** Authenticated. No body.

**Response:**
```json
{
  "success": true,
  "message": "QuickBooks account disconnected successfully"
}
```

**Process:**
1. Set `is_active = false` on connection record
2. Nullify tokens in database
3. Log audit event `qb.disconnected`

---

#### `POST /api/quickbooks/invoices`
Fetches outstanding invoices from QuickBooks API.

**Request:** Authenticated.
```json
{
  "dateFrom": "2026-01-01",
  "dateTo": "2026-06-14"
}
```

**Process:**
1. Retrieve and decrypt tokens for authenticated user
2. Refresh token if needed
3. Execute QB query for outstanding invoices in date range
4. Normalize response to internal invoice format
5. Calculate derived fields (days overdue, status)

**Response:**
```json
{
  "invoices": [
    {
      "qbInvoiceId": "12345",
      "invoiceNumber": "INV-001",
      "customerId": "67",
      "customerName": "Acme Corp",
      "invoiceDate": "2026-04-15",
      "dueDate": "2026-05-15",
      "totalAmount": 5000.00,
      "outstandingBalance": 5000.00,
      "daysOverdue": 30,
      "status": "overdue",
      "currencyCode": "USD"
    }
  ],
  "totalCount": 47,
  "fetchedAt": "2026-06-14T14:32:00Z"
}
```

**Error Response:**
```json
{
  "error": "QB_TOKEN_EXPIRED",
  "message": "QuickBooks connection has expired. Please reconnect your account.",
  "reconnectUrl": "/settings"
}
```

---

### 8.3 Report Endpoints

#### `POST /api/reports/generate`
Generates and persists a new report.

**Request:** Authenticated.
```json
{
  "dateFrom": "2026-01-01",
  "dateTo": "2026-06-14"
}
```

**Process:**
1. Fetch invoices from QB (calls `/api/quickbooks/invoices` logic internally)
2. Calculate summary metrics
3. Persist report record to `reports` table
4. Persist invoice records to `report_invoices` table
5. Log audit event `report.generated`
6. Return report with invoices

**Response:**
```json
{
  "report": {
    "id": "uuid",
    "dateFrom": "2026-01-01",
    "dateTo": "2026-06-14",
    "generatedAt": "2026-06-14T14:32:00Z",
    "summary": {
      "totalOutstanding": 127500.00,
      "invoiceCount": 47,
      "overdueCount": 23,
      "largestDebtorName": "Acme Corp",
      "largestDebtorAmount": 18500.00,
      "avgDaysOutstanding": 38.5
    },
    "invoices": [ /* array of invoice objects */ ]
  }
}
```

---

#### `GET /api/reports/history`
Returns the last 10 reports for the authenticated user.

**Request:** Authenticated. No body.

**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "dateFrom": "2026-01-01",
      "dateTo": "2026-06-14",
      "generatedAt": "2026-06-14T14:32:00Z",
      "summary": { /* metrics */ },
      "hasAiInsights": true
    }
  ]
}
```

---

#### `GET /api/reports/{reportId}`
Returns a specific report with full invoice detail.

**Request:** Authenticated.

**Response:** Same as `POST /api/reports/generate` response.

**Authorization:** 403 if `report.user_id !== auth.uid()` (enforced by RLS as well).

---

### 8.4 AI Analysis Endpoints

#### `POST /api/ai/analyze`
Generates AI insights for a report.

**Request:** Authenticated.
```json
{
  "reportId": "uuid"
}
```

**Process:**
1. Fetch report and invoices from database (verifies ownership via RLS)
2. Construct AI prompt with invoice data
3. Call AI provider (OpenRouter primary, Groq fallback)
4. Parse and validate JSON response
5. Update `reports.ai_insights` and `reports.ai_generated_at`
6. Log audit event `ai.analyzed`

**Response:**
```json
{
  "insights": {
    "executiveSummary": "Your accounts receivable position as of June 14, 2026 shows...",
    "highRiskCustomers": [
      {
        "customerName": "Acme Corp",
        "totalOwed": 18500.00,
        "longestOverdueDays": 67,
        "riskLevel": "high",
        "invoiceCount": 3
      }
    ],
    "overdueAnalysis": {
      "buckets": [
        { "label": "1-30 days", "count": 12, "totalBalance": 34200.00 },
        { "label": "31-60 days", "count": 7, "totalBalance": 21800.00 },
        { "label": "61-90 days", "count": 3, "totalBalance": 9400.00 },
        { "label": "90+ days", "count": 1, "totalBalance": 3200.00 }
      ],
      "commentary": "The majority of overdue invoices fall within the 1-30 day range..."
    },
    "collectionPriorities": [
      {
        "rank": 1,
        "customerName": "Acme Corp",
        "invoiceNumber": "INV-042",
        "amount": 8500.00,
        "daysOverdue": 67,
        "recommendation": "Escalate to senior contact. Consider payment plan discussion."
      }
    ],
    "cashFlowOutlook": {
      "expectedNext30Days": 45600.00,
      "atRiskAmount": 12600.00,
      "commentary": "Based on due dates, approximately $45,600 should be collectible..."
    }
  },
  "generatedAt": "2026-06-14T14:35:22Z",
  "provider": "openrouter",
  "model": "anthropic/claude-sonnet-4-6"
}
```

---

### 8.5 Export Endpoints

#### `GET /api/export/excel?reportId={uuid}`
Generates and streams an Excel file.

**Request:** Authenticated. Query param: `reportId`.

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="AR_Report_2026-06-14.xlsx"`
- Body: Binary Excel file stream

---

#### `GET /api/export/pdf?reportId={uuid}`
Generates and streams a PDF file.

**Request:** Authenticated. Query param: `reportId`.

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="AR_Report_2026-06-14.pdf"`
- Body: Binary PDF file stream

---

## 9. Security Design

### 9.1 Authentication Security

- **Provider:** Supabase Auth with JWT-based sessions
- **Session duration:** 24 hours, refresh token valid for 7 days
- **Password requirements:** Minimum 8 characters, 1 uppercase, 1 number
- **Email verification:** Required before first login
- **Brute force protection:** Supabase built-in rate limiting on auth endpoints
- **PKCE flow:** Used for all OAuth redirects

### 9.2 QuickBooks Token Security

- **Encryption at rest:** `pgp_sym_encrypt(token, APP_SECRET_KEY)` using pgcrypto extension
- **Encryption key:** Stored in Vercel environment variable `QB_TOKEN_ENCRYPTION_KEY`, never in codebase
- **In transit:** All communication over HTTPS/TLS 1.2+
- **Scope minimization:** Only `com.intuit.quickbooks.accounting` scope requested
- **Token logging:** Tokens never logged. Only token metadata (expiry times) logged.

### 9.3 API Security

- **Authentication:** All API routes except public landing page require valid Supabase session
- **Authorization:** Row Level Security policies enforce user data isolation at database level
- **CSRF protection:** State parameter in OAuth flows; SameSite cookies
- **Input validation:** Zod schemas validate all incoming request bodies
- **SQL injection:** Parameterized queries only via Supabase client (no raw SQL with user input)
- **Rate limiting:** Vercel Web Application Firewall (WAF) rate limiting on API routes
- **CORS:** Configured to allow only application origin

### 9.4 Data Privacy (GDPR Awareness)

- **Data minimization:** Only invoice data necessary for the product is fetched and stored
- **Retention policy:** Report data retained for 90 days; user may delete their account and all associated data at any time
- **Data deletion:** Cascade deletes configured on all user-associated tables
- **Export rights:** Users can export their own data (reports, profile)
- **No third-party data sharing:** Invoice data sent only to AI provider in API calls; AI provider must have zero-retention option (OpenRouter supports this)
- **Privacy policy:** Must be published before production launch (legal requirement)

### 9.5 Infrastructure Security

- **Environment variables:** All secrets stored in Vercel environment variables, never in codebase or version control
- **`.env.example`:** Only contains non-secret variable names with placeholder values
- **Dependency scanning:** Dependabot enabled on repository
- **Headers:** Security headers configured via `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` — appropriate for SaaS dashboard
- **Audit logging:** All sensitive actions logged to `audit_logs` table

### 9.6 Environment Variables Reference

```bash
# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# QuickBooks OAuth
QB_CLIENT_ID=
QB_CLIENT_SECRET=
QB_TOKEN_ENCRYPTION_KEY=    # 32-byte random string for token encryption

# AI Providers
AI_PROVIDER=openrouter       # openrouter | groq
AI_API_KEY=
AI_MODEL=anthropic/claude-sonnet-4-6
AI_FALLBACK_PROVIDER=groq
AI_FALLBACK_API_KEY=
AI_FALLBACK_MODEL=llama-3.3-70b-versatile
```

---

## 10. UX Flow

### 10.1 Page Map

```
/ (Landing Page)
├── /login
│   └── /reset-password
├── /register
└── /dashboard (authenticated)
    ├── /reports
    ├── /ai-insights
    └── /settings
```

### 10.2 Landing Page (`/`)

**Purpose:** Convert visitors to registered users or demo the product.

**Sections:**
1. **Hero:** Headline + subheadline + "Get Started Free" CTA + "See Demo" secondary CTA
2. **Problem/Solution:** 3 cards: "Scattered Data" → "Instant Reports" → "AI Insights"
3. **Feature Showcase:** Screenshots of dashboard, report table, and AI insights
4. **Social Proof:** Placeholder testimonials (for demo purposes)
5. **Pricing (future):** Freemium tier callout
6. **Footer:** Links to Privacy Policy, Terms of Service

**Design:** Clean SaaS landing page. Navy/blue brand color. White background. shadcn/ui components.

---

### 10.3 Authentication Pages

**Login (`/login`):**
- Email input
- Password input
- "Forgot Password?" link
- "Sign In" button
- "Don't have an account? Register" link
- Error message zone (below form)

**Register (`/register`):**
- Full Name input
- Email input
- Password input
- Confirm Password input
- "Create Account" button
- "Already have an account? Sign In" link
- Terms of Service checkbox

**Reset Password (`/reset-password`):**
- Step 1: Email input → "Send Reset Link" button
- Step 2 (after email): Confirmation message with instructions
- Step 3 (via email link): New password + confirm password form

---

### 10.4 Dashboard (`/dashboard`)

**Layout:** Persistent sidebar (left) with navigation links + top header with user menu.

**Sidebar items:**
- Dashboard (home icon)
- Reports (chart icon)
- AI Insights (sparkle/AI icon)
- Settings (gear icon)
- [bottom] User avatar + name + logout

**Dashboard Main Content:**

```
┌──────────────────────────────────────────────────────┐
│  [QuickBooks Status Badge]   Last updated: June 14   │
├──────────────────────────────────────────────────────┤
│  [KPI Card]        [KPI Card]       [KPI Card]       │
│  Total Outstanding  Overdue Count   Avg Days Out.    │
│  $127,500          23 invoices      38.5 days        │
├──────────────────────────────────────────────────────┤
│  [KPI Card]        [KPI Card]                        │
│  Total Invoices    Largest Debtor                    │
│  47                Acme Corp ($18,500)               │
├──────────────────────────────────────────────────────┤
│  [Quick Action: Generate New Report]                 │
│  [Quick Action: View Last Report]                    │
│  [Quick Action: Generate AI Insights]                │
└──────────────────────────────────────────────────────┘
```

**Empty State (no QB connection):**
- Illustration + "Connect your QuickBooks account to get started"
- "Connect QuickBooks" button

---

### 10.5 Reports Page (`/reports`)

```
┌──────────────────────────────────────────────────────┐
│  Outstanding Invoice Report                           │
│  ────────────────────────────────────────────────    │
│  From: [Date Picker]   To: [Date Picker]             │
│  [Generate Report]                                   │
├──────────────────────────────────────────────────────┤
│  [Export Excel] [Export PDF] [Generate AI Insights]  │
├──────────────────────────────────────────────────────┤
│  Filter: [Search customer...] [Status ▼] [Clear]     │
├──────────────────────────────────────────────────────┤
│  Invoice# | Customer | Inv Date | Due Date | Balance │
│  ────────────────────────────────────────────────    │
│  INV-042  | Acme Corp| Apr 15   | May 15   | $8,500  │
│  INV-039  | Beta LLC | Apr 10   | May 10   | $3,200  │
│  ...                                                 │
├──────────────────────────────────────────────────────┤
│  Showing 25 of 47  [< 1 2 >]                         │
└──────────────────────────────────────────────────────┘
```

**Loading state:** Skeleton table with animated pulse on rows.

**Report History:** Dropdown or separate section — "Previous Reports" showing last 10 with date and summary.

---

### 10.6 AI Insights Page (`/ai-insights`)

```
┌──────────────────────────────────────────────────────┐
│  AI Financial Insights                               │
│  Report: June 14, 2026  [Regenerate] [Copy All]      │
├──────────────────────────────────────────────────────┤
│  📋 Executive Summary                                 │
│  ────────────────────────────────────────────────    │
│  Your accounts receivable position as of...          │
├──────────────────────────────────────────────────────┤
│  ⚠️ High-Risk Customers                               │
│  ────────────────────────────────────────────────    │
│  1. Acme Corp — $18,500 — HIGH RISK                  │
│  2. Beta LLC  — $12,200 — MEDIUM RISK                │
├──────────────────────────────────────────────────────┤
│  📊 Overdue Analysis                                  │
│  [Visual aging buckets / bar chart]                  │
├──────────────────────────────────────────────────────┤
│  ✅ Collection Priorities                              │
│  1. Contact Acme Corp regarding INV-042...           │
│  2. Follow up with Beta LLC on 3 invoices...         │
├──────────────────────────────────────────────────────┤
│  💰 Cash Flow Outlook                                 │
│  Expected next 30 days: $45,600                      │
│  At-risk amount: $12,600                             │
└──────────────────────────────────────────────────────┘
```

**Loading state:** Animated gradient card with "AI is analyzing your invoice data..."

---

### 10.7 Settings Page (`/settings`)

**Sections:**

**Profile:**
- Full name (editable)
- Email (read-only)
- Company name (editable)
- Currency preference

**QuickBooks Connection:**
- Status: Connected / Disconnected
- Company name (if connected)
- Connected since date
- "Connect QuickBooks" or "Disconnect" button

**Account:**
- Change password
- Delete account (with confirmation)

---

### 10.8 UI Component Standards

**Colors (TailwindCSS):**
- Primary: `blue-600` (#2563EB)
- Success/Current: `green-600` (#16A34A)
- Warning/Due Today: `yellow-600` (#CA8A04)
- Danger/Overdue: `red-600` (#DC2626)
- Background: `gray-50` (#F9FAFB)
- Card background: `white`
- Sidebar: `slate-900`

**Typography:**
- Font: Inter (Google Fonts)
- Heading 1: 30px bold
- Heading 2: 24px semibold
- Body: 14px regular
- Table: 13px regular

**Status Badges:**
- `current` → green pill badge
- `due_today` → yellow pill badge
- `overdue` → red pill badge with days overdue count

**KPI Cards:**
- White card with subtle shadow
- Icon in colored circle (brand color)
- Large number in bold
- Subtext in gray

---

## 11. Roadmap

### MVP (Phase 1) — Weeks 1–6
Core features as defined in sections 4.1–4.6.

### V1.1 — Weeks 7–8
- Email notifications: weekly AR summary email to user
- Report scheduling: auto-generate report on schedule
- Company name on exported reports (user-configurable)
- UI polish and accessibility improvements
- Performance optimizations

### V2.0 — Quarter 2

#### AI Chat Interface
An interactive chat panel where users can query their invoice data in natural language.

**Example queries:**
- "Which customer owes me the most money?"
- "Show me all invoices overdue more than 60 days"
- "What is my total outstanding balance from customers in California?"
- "Which invoices are due this week?"

**Implementation approach:**
- OpenAI-compatible chat endpoint
- Tool-calling architecture: AI calls structured functions to query the database
- Streaming responses via Server-Sent Events
- Chat history persisted per session

**Agent Tool Definitions:**
```typescript
tools = [
  {
    name: "getInvoices",
    description: "Get outstanding invoices with optional filters",
    parameters: {
      customerName?: string,
      minDaysOverdue?: number,
      maxDaysOverdue?: number,
      minBalance?: number,
      status?: "current" | "overdue" | "due_today"
    }
  },
  {
    name: "getCustomers",
    description: "Get customer summary with total outstanding balances",
    parameters: {
      sortBy?: "balance" | "days_overdue" | "invoice_count",
      limit?: number
    }
  },
  {
    name: "getSummaryMetrics",
    description: "Get aggregate metrics for the current report",
    parameters: {}
  }
]
```

**Recommended frameworks:** PydanticAI (Python) or LangGraph for complex agent workflows. For Next.js-native approach: Vercel AI SDK with tool calls.

#### Multi-Company Support
- Connect multiple QuickBooks companies per account
- Switch between companies via dropdown
- Aggregate view across all companies

#### Report Templates
- Save custom date ranges and filters as templates
- Schedule template-based reports

---

### V3.0 — Quarter 3–4

#### Multi-Platform Integrations

**Xero Integration:**
- Same OAuth pattern as QuickBooks
- Map Xero invoice schema to internal invoice model
- Unified report across QB + Xero

**Stripe Integration:**
- Connect Stripe account via OAuth
- Pull outstanding payment links and unpaid invoices
- Cross-reference with QB invoices

**HubSpot Integration:**
- Connect HubSpot CRM
- Enrich invoice data with CRM customer data
- Surface deal stage alongside invoice status

#### AI Agent (Autonomous)
Long-term vision: an autonomous AI agent that:
- Monitors AR aging daily
- Identifies patterns (customers who always pay late, seasonal patterns)
- Drafts collection emails for user approval
- Tracks follow-up effectiveness

**Recommended framework:** LangGraph for stateful, multi-step agent workflows.

#### Platform: Agency Mode
- Manage multiple client companies from one account
- White-label report exports
- Client portal for sharing reports
- Team member access with role-based permissions

---

## 12. Success Metrics

### 12.1 Product Metrics (MVP)

| Metric | Definition | Target (Month 3) |
|--------|-----------|-----------------|
| Activation Rate | % of registered users who connect QB | > 60% |
| Report Generation Rate | Avg reports generated per active user/week | > 3 |
| AI Insights Usage | % of reports that generate AI insights | > 40% |
| Export Rate | % of reports that result in export | > 30% |
| D7 Retention | % of users active after 7 days | > 35% |
| D30 Retention | % of users active after 30 days | > 20% |

### 12.2 Technical Metrics

| Metric | Target |
|--------|--------|
| Report generation p95 latency | < 8 seconds |
| API error rate | < 1% |
| Uptime | > 99.5% |
| QB token refresh success rate | > 99% |
| AI insights success rate | > 95% |
| Core Web Vitals LCP | < 2.5s |

### 12.3 Business Metrics (Post-Launch)

| Metric | Definition |
|--------|-----------|
| MRR | Monthly Recurring Revenue |
| CAC | Cost per acquired customer |
| Churn Rate | Monthly customer churn |
| NPS | Net Promoter Score (target > 40) |
| Support Ticket Rate | Tickets per MAU (target < 5%) |

---

## 13. Development Phases

### Phase 0 — Setup (Days 1–3)

**Deliverables:**
- [ ] Create Next.js 15 project with TypeScript and TailwindCSS
- [ ] Install and configure shadcn/ui
- [ ] Create Supabase project and configure environment
- [ ] Run database migrations (all tables defined in section 7)
- [ ] Configure Vercel project and link to repository
- [ ] Set all environment variables in Vercel
- [ ] Configure QuickBooks developer account and create app
- [ ] Set up OpenRouter account and obtain API key
- [ ] Set up Groq account and obtain API key
- [ ] Initialize git repository with `.gitignore` (exclude `.env.local`)
- [ ] Create `.env.example` with all required variable names

**Done definition:** `npm run dev` starts without errors. Vercel preview deployment succeeds.

---

### Phase 1 — Authentication (Days 4–6)

**Deliverables:**
- [ ] Implement Supabase Auth integration (`@supabase/ssr`)
- [ ] Build Login page (`/login`) with form validation
- [ ] Build Register page (`/register`) with form validation
- [ ] Build Password Reset page (`/reset-password`)
- [ ] Implement auth middleware (protect dashboard routes)
- [ ] Implement `profiles` table trigger for auto-profile creation
- [ ] Build authenticated layout with sidebar and header
- [ ] Implement logout functionality

**Done definition:** User can register, verify email, login, reset password, and logout. Unauthenticated users are redirected to `/login`.

---

### Phase 2 — QuickBooks OAuth (Days 7–10)

**Deliverables:**
- [ ] Implement QB OAuth initiation endpoint (`/api/quickbooks/connect`)
- [ ] Implement QB OAuth callback endpoint (`/api/quickbooks/callback`)
- [ ] Implement token encryption/decryption with pgcrypto
- [ ] Implement token refresh logic
- [ ] Implement disconnect endpoint (`/api/quickbooks/disconnect`)
- [ ] Build Settings page with QB connection UI
- [ ] Test with QuickBooks Sandbox account
- [ ] Implement connection status display

**Done definition:** User can connect a QuickBooks Sandbox account, see connection status, and disconnect. Tokens are stored encrypted and auto-refresh.

---

### Phase 3 — Invoice Report (Days 11–16)

**Deliverables:**
- [ ] Implement QB invoice query endpoint
- [ ] Implement invoice normalization and derived field calculation
- [ ] Implement report generation and persistence
- [ ] Build Reports page with date range picker
- [ ] Build InvoiceTable component with sort, filter, pagination
- [ ] Build status badge component
- [ ] Implement report history sidebar/dropdown
- [ ] Build Dashboard with KPI cards
- [ ] Test with real QuickBooks Sandbox invoice data

**Done definition:** User can select a date range, generate a report, see the invoice table with all columns, sort and filter, and view KPI cards on dashboard.

---

### Phase 4 — Exports (Days 17–20)

**Deliverables:**
- [ ] Implement Excel export using ExcelJS
- [ ] Implement PDF export using pdf-lib
- [ ] Add export buttons to Reports page
- [ ] Test Excel output in Microsoft Excel and Google Sheets
- [ ] Test PDF output in browser and PDF viewers
- [ ] Verify formatting: bold headers, colored rows, proper column widths

**Done definition:** User can download a correctly formatted Excel and PDF file from any generated report.

---

### Phase 5 — AI Insights (Days 21–26)

**Deliverables:**
- [ ] Implement AI analysis API endpoint
- [ ] Implement OpenRouter client with fallback to Groq
- [ ] Write and test system prompt for financial analysis
- [ ] Implement Zod validation for AI response structure
- [ ] Build AI Insights page with section cards
- [ ] Implement loading state and error handling
- [ ] Test AI output quality with various invoice datasets
- [ ] Implement "Regenerate" and "Copy All" functionality
- [ ] Store AI insights in `reports.ai_insights`

**Done definition:** User can generate AI insights for any report, see all 5 sections rendered correctly, copy the full analysis, and regenerate.

---

### Phase 6 — Polish & QA (Days 27–35)

**Deliverables:**
- [ ] Implement landing page
- [ ] Full mobile responsiveness pass (375px to 1920px)
- [ ] Accessibility audit and fixes (keyboard nav, ARIA labels)
- [ ] Error boundary implementation for all major UI sections
- [ ] Loading skeleton components for all async sections
- [ ] Empty state designs for all pages
- [ ] Audit logging for all sensitive actions
- [ ] Security headers configuration in `next.config.ts`
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance testing (Lighthouse score > 85 on all metrics)
- [ ] End-to-end test run: register → connect QB → generate report → export → AI insights
- [ ] Environment variable audit (no secrets in code)

**Done definition:** Application passes manual QA checklist. Lighthouse score > 85. No console errors in production build.

---

### Phase 7 — Production Launch (Days 36–42)

**Deliverables:**
- [ ] Vercel production deployment with custom domain
- [ ] Supabase production environment (separate from development)
- [ ] QuickBooks app approved for production (submit for Intuit review)
- [ ] Privacy Policy and Terms of Service pages published
- [ ] Error monitoring configured (Vercel Analytics or Sentry)
- [ ] Uptime monitoring configured
- [ ] Final security review of all environment variables
- [ ] Database backup policy confirmed (Supabase automated backups)
- [ ] Soft launch with 5 beta users
- [ ] Feedback collection and bug triage

**Done definition:** Application is live at production URL. 5 beta users have successfully completed the full flow. No P1 bugs outstanding.

---

## Appendix A: QuickBooks API Reference

**Base URL:** `https://quickbooks.api.intuit.com/v3/company/{realmId}`  
**Sandbox URL:** `https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}`  
**Auth URL:** `https://appcenter.intuit.com/connect/oauth2`  
**Token URL:** `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`  
**Scopes:** `com.intuit.quickbooks.accounting`  

**Invoice Query:**
```
GET /query?query=SELECT * FROM Invoice WHERE Balance > '0'&minorversion=65
Headers:
  Authorization: Bearer {access_token}
  Accept: application/json
```

**Required QuickBooks Developer Account:**
- Create app at: https://developer.intuit.com
- Enable QuickBooks Online Accounting scope
- Set redirect URI to: `{APP_URL}/api/quickbooks/callback`
- Sandbox credentials provided immediately; production requires app review

---

## Appendix B: Package Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.5.0",
    "tailwindcss": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "exceljs": "^4.0.0",
    "pdf-lib": "^1.17.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

**shadcn/ui components to install:**
`button`, `card`, `input`, `label`, `select`, `table`, `badge`, `dialog`, `dropdown-menu`, `separator`, `skeleton`, `toast`, `calendar`, `popover`, `date-range-picker`

---

*End of PRD — QuickBooks AI Outstanding Invoice Analyzer v1.0*
