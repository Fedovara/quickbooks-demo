# MVP Build Plan v1.0
# QuickBooks AI Outstanding Invoice Analyzer

**Mindset:** Ship something real in 48 hours. Not perfect — real.  
**Date:** 2026-06-14  
**Rule:** Every hour spent on a non-core feature is an hour stolen from the first paying customer.

---

## Section 1 — MVP Definition

### MUST HAVE — The product does not exist without these

| Feature | Why it's mandatory |
|---------|-------------------|
| Landing page with CTA | Zero credibility without it. Clients google you before the demo. |
| Supabase email/password auth | Must know who the user is. Can't store QB tokens without it. |
| QuickBooks OAuth connect | The entire product depends on this. No QB connection = no data. |
| Outstanding invoice report (table) | This IS the product. The core value prop. |
| Date range filter | Without this, the report is a dump of everything. Useless. |
| Dashboard KPI cards (5 metrics) | The "wow" before the table. Numbers in big text = instant value. |
| AI financial summary (plain text) | Differentiator from native QB reports. Must be present for demo. |
| PDF export | The thing a client emails to their CFO. Proves the product is real. |

### SHOULD HAVE — Important but not blocking launch

| Feature | Why it's secondary |
|---------|-------------------|
| Report history (last 3) | Useful but a user can regenerate. Cut if time runs short. |
| Settings page | Profile editing adds no demo value. Quick disconnect link is enough. |
| Loading skeletons | Nice UX, not required. Spinners are fine for MVP. |
| Status badges (colored) | Table works without colors. Add after core works. |

### NICE TO HAVE — Post-launch only

| Feature | Defer because |
|---------|--------------|
| Excel export | PDF covers the demo. Excel is a day-3 feature. |
| Mobile responsive | Demo is on a laptop. Optimize desktop first. |
| Report comparison | Requires multiple reports. V1.1 feature. |
| Toast notifications | Console errors are fine for now. |
| Dark mode | Irrelevant to business value. |
| Password reset | Send users a Supabase magic link manually if needed. |

---

## Section 2 — NOT IN MVP

Everything below is explicitly excluded. Zero discussion.

| Excluded Feature | Why |
|----------------|-----|
| **Multi-user organizations** | You need 1 paying customer first, not 50 seats. |
| **Team permissions / RBAC** | A solo bookkeeper is the buyer. They don't need roles. |
| **Stripe billing** | Nothing to bill for yet. Charge first customers manually/via invoice. |
| **Advanced AI agent (tool calling)** | Simple LLM prompt delivers 90% of the value at 10% of the complexity. |
| **Multi-QuickBooks account** | Build for one company. Add multi-company in V2 when a bookkeeper buys it. |
| **Audit log dashboard** | Internal compliance tool. Clients don't see it. Write to DB, build UI later. |
| **Email notifications / scheduled reports** | The user will come back. We don't need push for demo. |
| **Xero / Stripe / Shopify integrations** | Vision is a platform. MVP proves the QuickBooks use case. |
| **AI chat interface** | Adds complexity with no proven demand. Build if clients ask for it. |
| **Account deletion flow** | No paying customers to delete yet. Handle manually if it comes up. |
| **API rate limiting (Upstash)** | Not needed for a demo with 1–5 users. Add before public launch. |
| **Sentry error tracking** | Check Vercel logs manually for now. |
| **Privacy Policy / Terms of Service** | Critical for public launch. Not needed for first demo. |
| **Excel export** | PDF is the deliverable clients want. Excel is a feature request, not a launch requirement. |
| **Report deletion** | No one needs to delete a report in day 1. |
| **Password reset flow** | Use Supabase dashboard to manually reset if needed during demo phase. |
| **Accessibility (WCAG)** | Ship first, optimize for accessibility before public marketing. |

**The test for everything:** "Does a prospect need to see this in a 10-minute demo to pull out their credit card?"  
If the answer is no, it's not in the MVP.

---

## Section 3 — Fastest Path to Value

The entire user journey must complete in under 2 minutes for a demo.

```
[0:00] Land on homepage
  → Headline + 3 value props + "Start Free" button
  → Takes 10 seconds to understand what the product does

[0:10] Click "Start Free" → Register page
  → Email + Password → Submit
  → Auto-login → Dashboard (empty state)

[0:20] Dashboard shows "Connect QuickBooks" banner
  → Click "Connect QuickBooks"
  → QuickBooks OAuth popup / redirect
  → User logs into their QB sandbox / real account
  → Redirect back → Dashboard now shows company name

[1:00] Click "Generate Report"
  → Date range pre-filled to last 90 days
  → Click "Generate"
  → 3-5 seconds loading
  → Table appears: 40+ invoices, sorted by days overdue

[1:20] See the numbers
  → KPI cards: $127,500 outstanding, 23 overdue, Acme Corp owes the most
  → Scroll table: colors, customer names, amounts, days overdue
  → INSTANT business value visible

[1:35] Click "Generate AI Summary"
  → 10-15 seconds
  → Professional paragraph appears:
    "Your accounts receivable exposure is $127,500 across 47 outstanding invoices..."
  → Client thinks: "My accountant charges $150/hour to write this."

[1:50] Click "Export PDF"
  → 2 seconds
  → PDF downloads to their desktop
  → Opens it: clean, branded, ready to email to their business partner

[2:00] Client says: "How much does this cost?"
```

That's the pitch. Everything else is noise.

---

## Section 4 — MVP Database

Four tables. Nothing else.

### Table 1: `profiles`
**Why:** We need to know who the user is and link everything to them.

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Auto-create on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Table 2: `quickbooks_connections`
**Why:** We must store encrypted QB tokens to make API calls on the user's behalf.

```sql
CREATE TABLE quickbooks_connections (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  realm_id              TEXT NOT NULL,
  company_name          TEXT NOT NULL,
  access_token          TEXT NOT NULL,
  refresh_token         TEXT NOT NULL,
  access_token_expiry   TIMESTAMPTZ NOT NULL,
  refresh_token_expiry  TIMESTAMPTZ NOT NULL,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  connected_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, realm_id)
);

ALTER TABLE quickbooks_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_connections" ON quickbooks_connections FOR ALL USING (auth.uid() = user_id);
```

### Table 3: `reports`
**Why:** Cache the generated data so we don't call QB on every page load and can export without re-fetching.

```sql
CREATE TABLE reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_from             DATE NOT NULL,
  date_to               DATE NOT NULL,
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_outstanding     NUMERIC(15,2),
  invoice_count         INTEGER,
  overdue_count         INTEGER,
  largest_debtor_name   TEXT,
  largest_debtor_amount NUMERIC(15,2),
  avg_days_outstanding  NUMERIC(8,2),
  invoices_json         JSONB NOT NULL DEFAULT '[]',  -- full invoice array cached here
  ai_summary            TEXT,
  ai_generated_at       TIMESTAMPTZ
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reports" ON reports FOR ALL USING (auth.uid() = user_id);
```

**MVP shortcut:** Store the invoice array as JSONB in the reports table instead of a separate `report_invoices` table. This eliminates one table, one join, and dozens of insert operations. For 500 invoices, the JSON is ~200KB — well within Supabase limits. Normalize to a proper table in V1.1.

### Table 4: Nothing else.

No `audit_logs`. No `ai_generations`. No `report_invoices`. They're in the architecture document for when we need them.

**Total: 3 tables. One SQL file. Done.**

---

## Section 5 — MVP UI

Five screens. Every pixel earns its place.

---

### Screen 1: Landing Page (`/`)

**Purpose:** Convert a cold visitor in 10 seconds. Establish credibility.

**Components:**
```
NAVBAR
  Logo (text) | Login | Get Started (button, primary color)

HERO
  H1: "Know Exactly Who Owes You Money"
  Sub: "Connect QuickBooks. Generate your AR report in 60 seconds. Export to PDF."
  CTA Button: "Connect QuickBooks Free"
  Hero image: screenshot of the dashboard (use placeholder first, replace after building)

3 VALUE PROPS (icon + title + 1 sentence each)
  ⚡ Instant Reports — "Outstanding invoices pulled from QuickBooks in seconds"
  🤖 AI Analysis   — "Plain-English summary of your collection risk"
  📄 PDF Export    — "Professional report ready to share with your team"

FOOTER
  © 2026 QB Invoice Analyzer | contact@email.com
```

**User actions:** Click "Get Started" or "Connect QuickBooks Free" → `/register`

**Success state:** Static page, always renders.

**Error state:** None — static page.

---

### Screen 2: Register / Login (`/register`, `/login`)

**Purpose:** Authenticate the user. Nothing else.

**Components:**
```
REGISTER
  Logo + "Create your free account"
  Full Name input
  Email input
  Password input
  "Create Account" button
  "Already have an account? Sign in"

LOGIN
  Logo + "Welcome back"
  Email input
  Password input
  "Sign In" button
  "Don't have an account? Register"
```

**User actions:** Submit form → call Server Action → redirect to `/dashboard`

**Success state:** Redirect to `/dashboard`

**Error state:** Inline error under form: "Invalid email or password"

**MVP cut:** No password reset. No social auth. No email verification (disable in Supabase settings for demo speed).

---

### Screen 3: Dashboard (`/dashboard`)

**Purpose:** Show value instantly. Surface the most important numbers. Drive the user to generate a report.

**Components:**
```
HEADER BAR
  Logo | QuickBooks: [Connected ✅ CompanyName] or [⚠️ Not Connected] | Logout

MAIN CONTENT

  IF NOT CONNECTED:
    Full-width banner (blue):
    "Connect your QuickBooks account to get started"
    [Connect QuickBooks] button

  IF CONNECTED + NO REPORT:
    5 KPI cards (all showing "—")
    [Generate Your First Report] button (large, centered)

  IF REPORT EXISTS:
    Last updated: June 14, 2026 at 14:32

    METRICS ROW (5 cards):
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │$127,500      │ │47            │ │23            │ │Acme Corp     │ │38.5 days     │
    │Outstanding   │ │Invoices      │ │Overdue       │ │Largest Debtor│ │Avg Outstanding│
    └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

    QUICK ACTIONS ROW:
    [📊 View Report] [🤖 AI Summary] [📄 Export PDF]
```

**User actions:** Click buttons → navigate to `/reports` or trigger AI/export.

**Success state:** KPI cards with real numbers.

**Error state:** "Error loading dashboard. Try refreshing." with reload button.

---

### Screen 4: Reports (`/reports`)

**Purpose:** This is the product. The full invoice table with controls.

**Components:**
```
PAGE HEADER: "Outstanding Invoice Report"

DATE RANGE ROW:
  From: [Date Input]   To: [Date Input]   [Generate Report] button

IF REPORT GENERATED:
  SECONDARY CONTROLS (right-aligned):
    [🤖 Generate AI Summary]  [📄 Export PDF]

  AI SUMMARY BOX (appears after AI click):
  ┌─────────────────────────────────────────────────────────┐
  │ 🤖 AI Financial Summary                    [Regenerate] │
  │                                                         │
  │ Your accounts receivable exposure is $127,500 across    │
  │ 47 outstanding invoices. Acme Corp represents your      │
  │ highest collection risk at $18,500 (67 days overdue)... │
  └─────────────────────────────────────────────────────────┘

  FILTER ROW:
    [Search customer...] | Status: [All ▼]

  INVOICE TABLE:
  ┌──────────┬──────────────┬────────────┬────────────┬───────────┬──────────┬───────────┐
  │ Invoice# │ Customer     │ Inv. Date  │ Due Date   │ Balance   │ Days Over│ Status    │
  ├──────────┼──────────────┼────────────┼────────────┼───────────┼──────────┼───────────┤
  │ INV-042  │ Acme Corp    │ 2026-04-15 │ 2026-05-15 │ $8,500.00 │ 30       │ OVERDUE   │
  │ INV-039  │ Beta LLC     │ 2026-04-10 │ 2026-05-10 │ $3,200.00 │ 35       │ OVERDUE   │
  │ INV-051  │ Gamma Inc    │ 2026-05-20 │ 2026-06-20 │ $5,000.00 │ 0        │ CURRENT   │
  └──────────┴──────────────┴────────────┴────────────┴───────────┴──────────┴───────────┘

  FOOTER: Showing 47 invoices | $127,500 total outstanding
```

**User actions:**
- Change dates → click Generate → table reloads
- Type in search → table filters client-side
- Change status dropdown → table filters client-side
- Click "Generate AI Summary" → loading text → AI box appears
- Click "Export PDF" → PDF downloads

**Loading state:** "Fetching invoices from QuickBooks..." spinner on Generate button.

**Empty state (no invoices):** "No outstanding invoices found for this date range."

**Error state:** "Failed to fetch invoices. Your QuickBooks connection may have expired. [Reconnect]"

---

### Screen 5: Settings (`/settings`)

**Purpose:** Manage QuickBooks connection. Nothing more.

**MVP cut:** No profile editing, no password change. Just connection management.

**Components:**
```
PAGE HEADER: "Settings"

QB CONNECTION CARD:
  ┌─────────────────────────────────────────────┐
  │ QuickBooks Connection                       │
  │                                             │
  │ Status:  ● Connected                        │
  │ Company: Acme Consulting LLC                │
  │ Since:   June 14, 2026                      │
  │                                             │
  │                    [Disconnect QuickBooks]  │
  └─────────────────────────────────────────────┘

  OR IF DISCONNECTED:
  ┌─────────────────────────────────────────────┐
  │ QuickBooks Connection                       │
  │                                             │
  │ Status:  ○ Not Connected                    │
  │                                             │
  │          [Connect QuickBooks]               │
  └─────────────────────────────────────────────┘
```

---

## Section 6 — MVP QuickBooks Integration

**Three endpoints. That's it.**

### Endpoint 1: Exchange authorization code for tokens

```
POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
```

Called once during OAuth callback. Gives us access + refresh tokens.

### Endpoint 2: Refresh access token

```
POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
  grant_type=refresh_token
```

Called automatically before every QB API call if the access token is within 5 minutes of expiry.

### Endpoint 3: Query outstanding invoices

```
GET https://quickbooks.api.intuit.com/v3/company/{realmId}/query
  ?query=SELECT * FROM Invoice WHERE Balance > '0' AND TxnDate >= '{from}' AND TxnDate <= '{to}' MAXRESULTS 1000
  &minorversion=65
```

This is the only data endpoint we need. One QB query. One table in QuickBooks. One response.

**We do NOT call:**
- Customer endpoint (customer name is embedded in Invoice response via `CustomerRef.name`)
- Payment endpoint (not needed for outstanding invoice view)
- Company info endpoint (grab it during OAuth callback once and store it)

**QB company info call (once, during callback):**
```
GET https://quickbooks.api.intuit.com/v3/company/{realmId}/companyinfo/{realmId}
```

Saves `CompanyName` to `quickbooks_connections.company_name`. Never called again.

---

## Section 7 — MVP AI

**Answer: B — Simple LLM Analysis**

**Not A (No AI)** because: The AI summary is the product differentiator. Without it, we're a QB report formatter. Any bookkeeper can build that in Excel. The AI is what makes us a SaaS product worth paying for.

**Not C (Full AI Agent)** because: Tool-calling agents with multiple steps add 3–5x development time, require streaming infrastructure, and can fail mid-conversation. For the demo, a polished paragraph beats a chatbot that might say something wrong on stage.

**The exact workflow:**

```
1. User clicks "Generate AI Summary"
2. Client → POST /api/ai/analyze { reportId }
3. Server:
   a. Fetch report + invoices_json from Supabase (already cached)
   b. Build prompt (see below)
   c. Call OpenRouter → claude-sonnet-4-6 (or Groq llama-3.3-70b fallback)
   d. Receive plain text response (NOT JSON — plain text is faster to implement)
   e. Save to reports.ai_summary
   f. Return { summary: "..." }
4. Client renders text in the AI box
5. Done
```

**The exact prompt:**

```
SYSTEM:
You are a senior financial analyst. Write a professional accounts receivable summary
for a business owner. Be specific with numbers. Use the customer names and amounts
from the data. Keep it to 3 paragraphs. Professional tone. No bullet points.
Do not use markdown. Plain text only.

USER:
Outstanding Invoice Report
Period: {dateFrom} to {dateTo}
Total Outstanding: ${totalOutstanding}
Invoice Count: {invoiceCount}
Overdue Count: {overdueCount}
Largest Debtor: {largestDebtorName} (${largestDebtorAmount})
Average Days Outstanding: {avgDaysOutstanding}

Top 10 overdue invoices:
{top10InvoicesAsSimpleText}

Write the summary now.
```

**Why plain text instead of JSON:** Zero parsing, zero Zod validation, zero schema errors. Just a string that renders directly in a `<p>` tag. We can add structured JSON output in V1.1.

**Why 3 paragraphs:** Concise enough to read in 30 seconds during a demo. Long enough to feel substantive.

---

## Section 8 — MVP Exports

**Answer: PDF only.**

**Why not Excel:**  
Excel requires ExcelJS (adds to bundle), complex cell formatting logic, and styling that takes hours to get right. The client wants to send a report to someone — email attachment, board deck, or printout. PDF is the universal deliverable.

**Why PDF:**  
- Works everywhere, no software required to open
- Looks "official" — feels like a real financial report
- Takes 30 minutes to implement a passable version with pdf-lib
- Demo moment: download → double-click → professional-looking document opens → client is impressed

**PDF contents (MVP — minimal):**

```
PAGE 1

QuickBooks AR Outstanding Report
[Company Name]
Report Period: January 1, 2026 – June 14, 2026
Generated: June 14, 2026

─────────────────────────────────

SUMMARY
Total Outstanding:    $127,500.00
Total Invoices:       47
Overdue Invoices:     23
Largest Debtor:       Acme Corp ($18,500)
Avg Days Outstanding: 38.5 days

─────────────────────────────────

AI SUMMARY
[Plain text from AI, wrapped to page width]

─────────────────────────────────

INVOICE DETAIL
Invoice# | Customer       | Due Date   | Balance    | Days Over | Status
INV-042  | Acme Corp      | 2026-05-15 | $8,500.00  | 30        | OVERDUE
INV-039  | Beta LLC       | 2026-05-10 | $3,200.00  | 35        | OVERDUE
...

[continues across pages if needed]

Page footer: Generated by QB Invoice Analyzer | [date]
```

---

## Section 9 — MVP Tech Stack

Every choice justified by speed and zero cost.

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js 15 (App Router) | We already know it. Server Actions = no separate API layer for auth. Free on Vercel. |
| **Styling** | TailwindCSS + shadcn/ui | Shadcn gives us production-quality components in minutes. Button, Card, Table, Input. No design time. |
| **Backend** | Next.js API Routes + Server Actions | No separate server. Everything runs in Vercel functions. Zero infra. |
| **Database** | Supabase (free tier) | Free PostgreSQL. Built-in Auth. Row Level Security. No Docker, no migrations headache. |
| **Auth** | Supabase Auth | Email/password in 20 lines of code. JWT sessions. Free. No custom auth logic. |
| **QB Integration** | Native `fetch()` | No SDK needed. QuickBooks REST API is straightforward. An SDK adds zero value here. |
| **AI** | OpenRouter API | Single endpoint, OpenAI-compatible. Access to Claude and fallback models. Pay-as-you-go. No commitment. $5 of credits covers thousands of demo runs. |
| **PDF** | pdf-lib | Pure TypeScript, no native dependencies, runs in Vercel functions. 500KB install. Works. |
| **Hosting** | Vercel (free tier) | Instant deploys from GitHub. Preview URLs per branch. Custom domain on free plan. |
| **Forms** | react-hook-form + zod | 30 seconds to add validation. No reinventing the wheel. |

**What we are NOT using:**
- ExcelJS (not needed — PDF only)
- Redis / Upstash (no rate limiting in MVP)
- Sentry (use Vercel logs)
- Stripe (no payments yet)
- Any charting library (CSS-based metrics in cards)
- PydanticAI / LangGraph (overkill for prompt → text)

**Total new paid services needed: $0**

---

## Section 10 — 48-Hour Build Plan

### Pre-Flight (Before Day 1 starts — 30 minutes)

- [ ] Create GitHub repository
- [ ] Create Supabase project (cloud.supabase.com)
- [ ] Create Vercel project → link GitHub repo
- [ ] Create QuickBooks developer account → create sandbox app → note Client ID + Secret
- [ ] Create OpenRouter account → generate API key → add $5 credit
- [ ] Create Groq account → generate API key (free)
- [ ] Have a QB Sandbox company ready with 20+ invoices (some overdue)

---

### Day 1 — The Foundation (8 hours)

**Hour 1: Project Scaffolding**
```bash
npx create-next-app@latest qb-analyzer --typescript --tailwind --app --src-dir --import-alias "@/*"
cd qb-analyzer
npx shadcn@latest init
npx shadcn@latest add button card input label table badge dialog select skeleton separator sonner
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers date-fns pdf-lib lucide-react clsx tailwind-merge
```

Create `.env.local` with all variables. Push to GitHub. Verify Vercel deploys green.

**Hour 2: Database + Supabase Setup**

Run in Supabase SQL Editor:
```sql
-- profiles table
-- quickbooks_connections table  
-- reports table (with invoices_json JSONB column)
-- RLS policies
-- handle_new_user() trigger
```

Create `src/services/supabase/client.ts`, `server.ts`  
Create `src/middleware.ts` with auth guard on `/dashboard`, `/reports`, `/settings`  
Create `src/lib/encryption.ts` (AES-256-GCM)  
Create `src/lib/cn.ts`, `src/lib/currency.ts`, `src/lib/dates.ts`

**Hour 3: Authentication**

Create `src/features/auth/schemas.ts`  
Create `src/actions/auth.ts` (login, register, logout)  
Create `src/app/(auth)/layout.tsx` — simple centered card  
Create `src/app/(auth)/login/page.tsx`  
Create `src/app/(auth)/register/page.tsx`  
Create `src/app/api/auth/callback/route.ts`  

**Test:** Register → confirm (disabled in Supabase for speed) → login → redirects to `/dashboard`

**Hour 4: QuickBooks OAuth**

Create `src/types/quickbooks.ts`  
Create `src/services/quickbooks/client.ts` (buildAuthorizationUrl, exchangeCodeForTokens)  
Create `src/services/quickbooks/auth.ts` (getActiveConnection, getValidAccessToken, refreshAccessToken)  
Create `src/app/api/quickbooks/connect/route.ts`  
Create `src/app/api/quickbooks/callback/route.ts`  
Create `src/app/api/quickbooks/disconnect/route.ts`  

**Test:** Click Connect → QB Sandbox login → callback → see company name stored in Supabase. Token encrypted. Disconnect clears it.

**Hour 5: Invoice Fetching + Normalization**

Create `src/types/invoice.ts`, `src/types/report.ts`  
Create `src/services/quickbooks/invoices.ts` (getOutstandingInvoices)  
Create `src/features/quickbooks/normalizer.ts` (normalizeInvoice)  
Create `src/features/quickbooks/calculations.ts` (calculateDaysOverdue, deriveStatus)  
Create `src/features/reports/metrics.ts` (calculateSummaryMetrics)  

**Test:** Call getOutstandingInvoices from a test script with real Sandbox tokens. Verify 20+ invoices return with correct normalized shape.

**Hour 6: Report Generation API**

Create `src/app/api/reports/generate/route.ts` — full pipeline:
- Auth check
- Zod validate dateFrom + dateTo
- Call QB invoices endpoint
- Normalize all invoices
- Calculate metrics
- INSERT into reports (with invoices_json)
- Return { report, invoices }

Create `src/app/api/reports/latest/route.ts` — returns most recent report for the user.

**Test:** POST to `/api/reports/generate` via curl or Postman. Verify Supabase `reports` row created with correct metrics and invoices_json populated.

**Hour 7: Dashboard + Reports UI**

Create `src/components/layout/Sidebar.tsx` — 3 links: Dashboard, Reports, Settings  
Create `src/components/layout/Header.tsx` — QB connection status badge + logout  
Create `src/app/(dashboard)/layout.tsx` — sidebar + header wrapper  
Create `src/components/dashboard/KPICard.tsx` — icon + label + value  
Create `src/app/(dashboard)/dashboard/page.tsx` — RSC: fetch latest report → 5 KPI cards

Create `src/components/reports/StatusBadge.tsx`  
Create `src/components/reports/InvoiceTable.tsx` — client component with useState for filter/sort  
Create `src/app/(dashboard)/reports/page.tsx` — date pickers + generate button + table

**Test:** Dashboard shows 5 real KPI numbers. Reports page shows full table with 20+ rows. Client-side filter by customer name works.

**Hour 8: End-of-Day Checkpoint + Deploy**

- Fix any type errors: `npx tsc --noEmit`
- Push to GitHub → verify Vercel preview URL
- Test full flow on preview URL: register → connect QB → generate report → see data
- Fix any environment variable issues in Vercel dashboard
- Create a sandbox QB test company with 30+ invoices (some overdue 30/60/90 days) if not done
- Note all bugs → prioritize for Day 2

**End of Day 1 deliverable:** Working auth + QB OAuth + report generation + table display. The core is alive.

---

### Day 2 — Polish + AI + Export + Demo-Ready (8 hours)

**Hour 9: AI Summary**

Create `src/types/ai.ts`  
Create `src/services/ai/client.ts` — callProvider with OpenRouter primary + Groq fallback  
Create `src/features/ai/prompts.ts` — system prompt + buildUserMessage()  
Create `src/app/api/ai/analyze/route.ts`:
- Auth check
- Fetch report by reportId
- Build prompt from report metrics + top 10 invoices
- Call AI provider
- Save to `reports.ai_summary`
- Return { summary: "..." }

Add AI summary UI to Reports page:
- "Generate AI Summary" button
- Loading state: "Analyzing your invoices..."
- Result: renders in a card below the controls

**Test:** Click button → 10-15 seconds → professional paragraph appears. Try with Groq fallback (set wrong OpenRouter key temporarily). Verify it still works.

**Hour 10: PDF Export**

Create `src/features/export/pdf.ts` — buildPDFDocument():
- Header: company name, report period, generation date
- Summary metrics table
- AI summary text (if available)
- Invoice table with rows (Invoice#, Customer, Due Date, Balance, Days Overdue, Status)
- Page breaks when Y < 100
- Footer with page numbers

Create `src/app/api/export/pdf/route.ts`:
- Auth check
- Fetch report by reportId
- Call buildPDFDocument()
- Stream as binary response

Add "Export PDF" button to Reports page and Dashboard quick actions.

**Test:** Download PDF. Open in browser and desktop PDF viewer. Verify data is correct. Verify page breaks work for 30+ invoices.

**Hour 11: Settings Page + Connection Management**

Create `src/app/(dashboard)/settings/page.tsx`  
Create `src/components/settings/QBConnectionCard.tsx`  

Simple page — just the connection card. Connected status + company name + disconnect button. Done.

Add Settings link to Sidebar. Add "Settings" nav item to Header as fallback.

**Hour 12: Landing Page**

Create `src/app/page.tsx`:

```tsx
// Three sections, no dependencies, no data fetching
// 1. Navbar: Logo + Login + Get Started
// 2. Hero: Big headline + subline + CTA button + screenshot placeholder
// 3. Three value prop cards
// 4. Footer
```

Use a screenshot of the actual dashboard (take one from your Vercel preview) as the hero image. This makes it feel real. Save as `public/dashboard-preview.png`.

**Hour 13: UI Polish Pass**

Work through every page in order:

**Dashboard:**
- Empty state when no report exists (illustration + CTA)
- Empty state when QB not connected (banner)
- Make KPI card numbers bold and large (text-3xl font-bold)
- Currency format: `$127,500.00`

**Reports:**
- Add column header click-to-sort for Outstanding Balance and Days Overdue
- Status badge colors: red=overdue, yellow=due today, green=current
- Loading spinner while generating report
- "Showing X invoices | $Y total outstanding" footer line
- Handle empty results

**AI Box:**
- Clean card with subtle left border (blue)
- "Generated by AI — for guidance only" small text below summary
- Copy button (clipboard icon)

**PDF:**
- Verify font sizes are readable
- Check overdue rows are visually distinct (light red background)

**Hour 14: Error Handling Pass**

Every async operation must fail gracefully:

- QB not connected → redirect to `/settings` with message
- QB token expired → show "Reconnect QuickBooks" banner
- QB API error → "Unable to fetch invoices. Please try again."
- AI provider failed (both) → "AI analysis temporarily unavailable. Your report is still complete."
- PDF generation failed → "Export failed. Please try again."
- All errors: never show a raw error stack. Always a human-readable message.

Wrap Dashboard and Reports pages in `error.tsx` error boundaries.

**Hour 15: Final Testing + Seed Data**

Create a good test QuickBooks Sandbox company:
- 5–8 customers with memorable names (Acme Corp, Beta LLC, Gamma Industries, etc.)
- 30–40 invoices
- Mix: 10 current, 10 overdue 1-30 days, 8 overdue 31-60 days, 5 overdue 60+ days
- Total outstanding: ~$75,000–$150,000 (feels real)
- Largest debtor: one customer owes 30%+ of total

Run the full flow 3 times end-to-end:
1. First run: verify everything works
2. Second run: test all error states (disconnect QB mid-session, etc.)
3. Third run: time it — entire flow from login to PDF download must be under 2 minutes

Fix any bugs found.

**Hour 16: Production Deploy + Demo Prep**

- Set all production environment variables in Vercel
- Deploy to production: `git push origin main`
- Test on production URL (not preview)
- Set up custom domain if you have one (takes 5 minutes on Vercel)
- Take final screenshots for the landing page hero
- Write the 3 demo sentences:
  1. "This connects to your QuickBooks and shows you exactly who owes you money."
  2. "Click here and it generates the report in about 5 seconds."
  3. "The AI writes this summary — your accountant used to spend an hour doing this manually."

**MVP is live. Ship it.**

---

## Section 11 — First Client Demo

### Setup (5 minutes before demo)

- Open browser in incognito window (no browser history, no autofill)
- Have the QB Sandbox account with your demo data ready to connect
- Pre-navigate to the landing page URL
- Have the report already generated and AI summary already loaded (so demo runs smoothly — you can still click "Regenerate" to show it working live)

### The Demo Script (10 minutes)

**[0:00–0:30] The Hook — "Do you know exactly who owes you money right now?"**

Open the landing page. Don't touch anything yet.

Say: *"Right now, what would you need to do to know the total outstanding invoices in your business and who the top 5 people are that haven't paid?"*

Wait for their answer. It's usually: "I'd have to log into QuickBooks and run a report... or ask my bookkeeper."

Say: *"Let me show you what this looks like instead."*

Click "Get Started."

**[0:30–1:30] Registration + Connection**

Register a new account (pre-fill with fake details so it's fast). Connect QuickBooks.

Say: *"We're using QuickBooks' official secure connection — your credentials never touch our servers."*

After callback: *"Done. It found your company. Now let's pull your data."*

**[1:30–2:30] The Wow — Report Generation**

Navigate to Reports. Default dates: last 90 days. Click "Generate Report."

5 seconds of loading. The table appears.

Say nothing for 3 seconds. Let them read the numbers.

Then: *"$127,500 outstanding. 23 overdue invoices. And Acme Corp owes you the most — $18,500 and it's been 67 days."*

Watch their reaction. This is the wow moment.

**[2:30–3:30] The Differentiator — AI Summary**

Click "Generate AI Summary." Wait 10 seconds.

The summary appears.

Read the first sentence aloud: *"'Your accounts receivable exposure of $127,500 represents a significant liquidity risk, with 49% of outstanding balances past due. Immediate attention should be directed toward Acme Corp...' — This took 10 seconds. How long does this take your accountant to write?"*

**[3:30–4:00] The Deliverable — PDF Export**

Click "Export PDF." It downloads. Open it.

Say: *"This is the file you email to your business partner, your board, or your bank. Clean, professional, ready."*

Flip through the pages. Let them see the invoice table.

**[4:00–10:00] Questions + Pain Discovery**

Stop demoing. Ask:

- "How often do you need this report today?"
- "Who else in your team needs to see this?"
- "What would you do differently if you could get this in 60 seconds every morning?"

The demo is over. Now you're selling.

### The "Wow" Moment Breakdown

The wow happens in **seconds 90–120** — when the table loads and they see their own data (or realistic dummy data) with the total at the bottom. 

Not the AI. Not the PDF. The **numbers appearing from their own accounting system** in under 5 seconds. That's the moment. Everything else is gravy.

---

## Section 12 — MVP Success Criteria

The MVP is ready to demo when ALL of these are true:

**Functionality:**
- [ ] A new user can register with email + password and access the dashboard in under 30 seconds
- [ ] QuickBooks OAuth flow completes successfully with a Sandbox account
- [ ] Outstanding invoice report generates in under 8 seconds for 50 invoices
- [ ] Invoice table shows all 7 columns (Invoice#, Customer, Inv Date, Due Date, Balance, Days Overdue, Status)
- [ ] Customer name filter works client-side with no lag
- [ ] AI summary generates in under 20 seconds and outputs 3 coherent professional paragraphs
- [ ] PDF downloads and opens correctly, containing summary metrics + AI text + invoice table
- [ ] Dashboard KPI cards show correct numbers matching the report

**Reliability:**
- [ ] Full flow runs 3 consecutive times without an error
- [ ] QB token refresh works without user action (tested by waiting 65 minutes and regenerating)
- [ ] AI fallback to Groq works when primary provider key is invalid
- [ ] Invalid date range (end before start) shows a validation error, not a crash

**Demo Quality:**
- [ ] Landing page loads in under 2 seconds
- [ ] No browser console errors visible during the demo flow
- [ ] No raw JSON or stack traces visible anywhere in the UI
- [ ] Every loading state shows a spinner or "Loading..." text — no blank screens
- [ ] PDF looks professional enough to send to a CFO without apology

**Deployment:**
- [ ] Application runs on Vercel production URL (not localhost, not preview)
- [ ] All environment variables set in Vercel (no missing vars causing runtime errors)
- [ ] QuickBooks redirect URI matches the production domain

**The 2-Minute Test:**  
Time the full flow from landing page to PDF download. If it takes more than 2 minutes, something needs to be faster or the demo script needs to be shortened.

---

## Section 13 — Claude Code Execution Roadmap

Ordered for zero dependency conflicts. Build this file-by-file, test at each checkpoint.

```
STEP 1 — SCAFFOLDING (30 min)
  Run: npx create-next-app@latest
  Run: npx shadcn@latest init
  Run: npm install [all dependencies]
  Create: .env.local
  Create: .env.example
  Push to GitHub → verify Vercel preview builds green

STEP 2 — UTILITIES + TYPES (20 min)
  Create: src/lib/cn.ts
  Create: src/lib/currency.ts
  Create: src/lib/dates.ts
  Create: src/lib/encryption.ts
  Create: src/types/invoice.ts
  Create: src/types/report.ts
  Create: src/types/quickbooks.ts
  Run: npx tsc --noEmit → must pass

STEP 3 — DATABASE (20 min)
  Run SQL in Supabase: profiles, quickbooks_connections, reports tables
  Run SQL: RLS policies
  Run SQL: handle_new_user() trigger
  Create: src/services/supabase/client.ts
  Create: src/services/supabase/server.ts
  Verify in Supabase Studio: 3 tables exist, RLS enabled

STEP 4 — AUTH (45 min)
  Create: src/middleware.ts
  Create: src/features/auth/schemas.ts
  Create: src/actions/auth.ts
  Create: src/app/(auth)/layout.tsx
  Create: src/app/(auth)/login/page.tsx
  Create: src/app/(auth)/register/page.tsx
  Create: src/app/api/auth/callback/route.ts
  Create: src/app/layout.tsx
  TEST: Register → login → redirects to /dashboard (404 is fine) → logout → /login

STEP 5 — QB OAUTH (60 min — this is the hardest part)
  Create: src/services/quickbooks/client.ts
  Create: src/services/quickbooks/auth.ts
  Create: src/app/api/quickbooks/connect/route.ts
  Create: src/app/api/quickbooks/callback/route.ts
  Create: src/app/api/quickbooks/disconnect/route.ts
  TEST: Connect → QB Sandbox login → redirect back → check Supabase: token row exists, encrypted
  TEST: Wait 65 min OR manually set expiry to past → generate report → verify token refresh
  If OAuth redirect URI error: verify QB developer app redirect URI matches NEXT_PUBLIC_APP_URL

STEP 6 — QB INVOICE FETCH (30 min)
  Create: src/services/quickbooks/invoices.ts
  Create: src/features/quickbooks/calculations.ts
  Create: src/features/quickbooks/normalizer.ts
  Create: src/features/reports/metrics.ts
  TEST: Add temporary test route → call getOutstandingInvoices → log results → verify shape

STEP 7 — REPORT API (30 min)
  Create: src/app/api/reports/generate/route.ts
  Create: src/app/api/reports/latest/route.ts
  TEST: POST /api/reports/generate with date range → check Supabase reports table
  Verify: invoices_json populated, metrics calculated correctly

STEP 8 — LAYOUT + NAVIGATION (30 min)
  Create: src/components/layout/Sidebar.tsx
  Create: src/components/layout/Header.tsx
  Create: src/app/(dashboard)/layout.tsx
  Verify: Navigate between /dashboard, /reports, /settings → sidebar highlights active

STEP 9 — DASHBOARD PAGE (30 min)
  Create: src/components/dashboard/KPICard.tsx
  Create: src/app/(dashboard)/dashboard/page.tsx
  TEST: Generate a report → navigate to dashboard → 5 KPI cards show real numbers
  TEST: No QB connection → banner appears

STEP 10 — REPORTS PAGE (60 min — most UI work)
  Create: src/components/reports/StatusBadge.tsx
  Create: src/components/reports/InvoiceTable.tsx  [client component]
  Create: src/app/(dashboard)/reports/page.tsx
  TEST: Date range → Generate → table loads → sort by Days Overdue → filter by customer
  TEST: 0 results → empty state message shows

STEP 11 — AI SUMMARY (45 min)
  Create: src/services/ai/client.ts
  Create: src/features/ai/prompts.ts
  Create: src/app/api/ai/analyze/route.ts
  Add AI button + result box to: src/app/(dashboard)/reports/page.tsx
  TEST: Click Generate AI Summary → wait → paragraph appears
  TEST: Set AI_API_KEY to invalid → verify fallback to Groq works
  TEST: AI summary saved to reports.ai_summary in Supabase

STEP 12 — PDF EXPORT (45 min)
  Create: src/features/export/pdf.ts
  Create: src/app/api/export/pdf/route.ts
  Add Export PDF button to: reports page + dashboard
  TEST: Download PDF → open → verify metrics, AI summary, invoice table all present
  TEST: 40+ invoices → verify page breaks work correctly

STEP 13 — SETTINGS PAGE (20 min)
  Create: src/components/settings/QBConnectionCard.tsx
  Create: src/app/(dashboard)/settings/page.tsx
  TEST: Connected state shows company name + disconnect button
  TEST: Click disconnect → reconnect → works

STEP 14 — LANDING PAGE (30 min)
  Create: src/app/page.tsx
  Take screenshot of dashboard → save as public/dashboard-preview.png
  Replace placeholder with real screenshot
  TEST: Load / as logged-out user → page renders → click Get Started → /register

STEP 15 — ERROR HANDLING PASS (30 min)
  Add try/catch with user-friendly messages to every API route
  Add error.tsx to (dashboard) route group
  TEST: Disconnect QB → go to reports → try to generate → see "Reconnect QuickBooks" message
  TEST: Set QB_CLIENT_SECRET to wrong value → OAuth fails → see friendly error

STEP 16 — FINAL CHECKS + PRODUCTION DEPLOY (30 min)
  Run: npx tsc --noEmit  → zero errors
  Run full flow 3 times end-to-end
  Set production env vars in Vercel dashboard
  Push main → production deploy
  Test on production URL
  Run the 2-minute demo timing test
  Ship.
```

---

## Appendix — The One Question That Matters

Before every hour of work on this MVP, ask:

> "Does this feature help a prospect say yes in the demo?"

If the answer is no, stop. Write it in a `BACKLOG.md` file. Build it after the first paying customer.

The MVP is not the product. The MVP is the proof that the product is worth building.

---

*MVP Build Plan v1.0 — Ship in 48 hours or die trying.*
