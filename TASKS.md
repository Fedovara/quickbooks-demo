# TASKS.md
# QuickBooks AI Outstanding Invoice Analyzer — MVP Build

> **Istruzioni per Claude Code:** Esegui i task in ordine numerico. Ogni task ha una singola responsabilità. Segna `[x]` al completamento. Non passare al task successivo se i criteri di accettazione non sono soddisfatti.

---

## Phase 1 — Project Setup

---

### Task 1.1: Inizializzare il progetto Next.js

**Goal:** Creare il progetto Next.js con le opzioni corrette per App Router, TypeScript e TailwindCSS.

**Files To Create:**
- `package.json` (generato da scaffolding)
- `tsconfig.json` (generato)
- `next.config.ts` (generato)
- `src/app/layout.tsx` (generato)
- `src/app/page.tsx` (generato)

**Files To Modify:** nessuno

**Dependencies:** Node.js 20+ installato

**Command:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git
```

**Acceptance Criteria:**
- [ ] `npm run dev` si avvia senza errori sulla porta 3000
- [ ] `http://localhost:3000` restituisce la pagina Next.js default
- [ ] `src/app/layout.tsx` e `src/app/page.tsx` esistono
- [ ] `tsconfig.json` ha `"paths": { "@/*": ["./src/*"] }`
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 1.2: Configurare next.config.ts con security headers

**Goal:** Aggiungere security headers HTTP alla configurazione Next.js per proteggere l'applicazione.

**Files To Create:** nessuno

**Files To Modify:**
- `next.config.ts`

**Dependencies:** Task 1.1 completato

**Implementation:**
```typescript
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
]

const config: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default config
```

**Acceptance Criteria:**
- [ ] `next.config.ts` esporta una configurazione valida
- [ ] `npm run dev` si avvia senza errori dopo la modifica
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 1.3: Installare le dipendenze npm

**Goal:** Installare tutti i pacchetti necessari per il MVP in un'unica operazione.

**Files To Modify:**
- `package.json` (aggiornato da npm)

**Dependencies:** Task 1.1 completato

**Command:**
```bash
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers date-fns pdf-lib lucide-react clsx tailwind-merge
```

**Acceptance Criteria:**
- [ ] Tutti i pacchetti installati senza errori
- [ ] Nessun `npm audit` con vulnerabilità critiche
- [ ] `node_modules/@supabase/ssr` esiste
- [ ] `node_modules/pdf-lib` esiste
- [ ] `npm run dev` continua a funzionare

**Complexity:** Low

---

### Task 1.4: Configurare shadcn/ui

**Goal:** Inizializzare shadcn/ui con le impostazioni corrette per il progetto.

**Files To Create:**
- `components.json`

**Files To Modify:**
- `src/app/globals.css` (aggiunto CSS variables shadcn)
- `tailwind.config.ts` (aggiornato con preset shadcn)

**Dependencies:** Task 1.1, Task 1.3

**Command:**
```bash
npx shadcn@latest init
```

Scegliere durante il wizard:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

**Acceptance Criteria:**
- [ ] `components.json` esiste con `"style": "default"`
- [ ] `src/app/globals.css` contiene le CSS variables (`--background`, `--foreground`, ecc.)
- [ ] `tailwind.config.ts` importa il preset shadcn
- [ ] `npm run dev` si avvia senza errori

**Complexity:** Low

---

### Task 1.5: Installare i componenti shadcn/ui necessari

**Goal:** Installare tutti i componenti shadcn/ui che verranno usati nel MVP in una sola operazione.

**Files To Create:**
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/calendar.tsx`

**Dependencies:** Task 1.4

**Command:**
```bash
npx shadcn@latest add button card input label table badge dialog select skeleton separator sonner popover calendar
```

**Acceptance Criteria:**
- [ ] Tutti i file `src/components/ui/*.tsx` esistono
- [ ] `npx tsc --noEmit` passa senza errori
- [ ] `npm run dev` si avvia senza errori

**Complexity:** Low

---

### Task 1.6: Creare il file .env.example

**Goal:** Documentare tutte le variabili d'ambiente necessarie con nomi ma senza valori reali.

**Files To Create:**
- `.env.example`

**Dependencies:** nessuno (può essere fatto in parallelo con altri task)

**Content:**
```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# QuickBooks OAuth
QB_CLIENT_ID=
QB_CLIENT_SECRET=
QB_TOKEN_ENCRYPTION_KEY=

# AI Providers
AI_PROVIDER=openrouter
AI_API_KEY=
AI_MODEL=anthropic/claude-sonnet-4-6
AI_FALLBACK_PROVIDER=groq
AI_FALLBACK_API_KEY=
AI_FALLBACK_MODEL=llama-3.3-70b-versatile
```

**Acceptance Criteria:**
- [ ] `.env.example` esiste nella root del progetto
- [ ] Contiene esattamente le variabili elencate sopra
- [ ] Nessun valore reale/segreto presente nel file
- [ ] `.env.example` è committato in git (non nel `.gitignore`)

**Complexity:** Low

---

### Task 1.7: Creare il file .env.local con i valori reali

**Goal:** Creare il file delle variabili d'ambiente locali con i valori reali per lo sviluppo.

**Files To Create:**
- `.env.local`

**Dependencies:** Task 1.6 — account Supabase, QuickBooks Developer, OpenRouter, Groq già creati

**Instructions:**
Copiare `.env.example` in `.env.local` e compilare ogni variabile:

1. `NEXT_PUBLIC_SUPABASE_URL` — da Supabase Dashboard → Project Settings → API
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` — da Supabase Dashboard → Project Settings → API
3. `SUPABASE_SERVICE_ROLE_KEY` — da Supabase Dashboard → Project Settings → API (service_role)
4. `QB_CLIENT_ID` — da developer.intuit.com → App → Keys
5. `QB_CLIENT_SECRET` — da developer.intuit.com → App → Keys
6. `QB_TOKEN_ENCRYPTION_KEY` — generare con: `openssl rand -hex 32`
7. `AI_API_KEY` — da openrouter.ai → Keys
8. `AI_FALLBACK_API_KEY` — da console.groq.com → API Keys

**Acceptance Criteria:**
- [ ] `.env.local` esiste nella root
- [ ] `.env.local` è presente in `.gitignore` (verificare)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` inizia con `https://`
- [ ] `QB_TOKEN_ENCRYPTION_KEY` è lungo esattamente 64 caratteri hex (32 byte)
- [ ] `npm run dev` si avvia senza warning su variabili mancanti

**Complexity:** Low

---

### Task 1.8: Configurare .gitignore

**Goal:** Assicurarsi che file sensibili e artefatti di build siano esclusi dal repository git.

**Files To Modify:**
- `.gitignore`

**Dependencies:** Task 1.1 (Next.js crea un .gitignore di default)

**Verificare che .gitignore contenga:**
```
# env files
.env.local
.env.*.local

# Next.js
.next/
out/

# dependencies
node_modules/

# debug
npm-debug.log*
```

Se manca qualcosa, aggiungerlo.

**Acceptance Criteria:**
- [ ] `.env.local` è in `.gitignore`
- [ ] `node_modules/` è in `.gitignore`
- [ ] `.next/` è in `.gitignore`
- [ ] `git status` non mostra `.env.local` come file tracciato

**Complexity:** Low

---

### Task 1.9: Creare le utility di base — cn.ts

**Goal:** Creare l'helper `cn()` per combinare classi Tailwind in modo sicuro, usato da tutti i componenti.

**Files To Create:**
- `src/lib/cn.ts`

**Dependencies:** Task 1.3 (`clsx` e `tailwind-merge` installati)

**Implementation:**
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Acceptance Criteria:**
- [ ] File esiste in `src/lib/cn.ts`
- [ ] `npx tsc --noEmit` passa senza errori
- [ ] La funzione accetta numero arbitrario di argomenti
- [ ] Importabile con `import { cn } from '@/lib/cn'`

**Complexity:** Low

---

### Task 1.10: Creare le utility di formattazione valuta — currency.ts

**Goal:** Creare una funzione di formattazione valuta riutilizzabile in tutto il progetto.

**Files To Create:**
- `src/lib/currency.ts`

**Dependencies:** Task 1.9

**Implementation:**
```typescript
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
```

**Acceptance Criteria:**
- [ ] `formatCurrency(127500)` restituisce `"$127,500.00"`
- [ ] `formatCurrency(1000, 'EUR')` restituisce `"€1,000.00"`
- [ ] `formatNumber(38.5)` restituisce `"38.5"`
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 1.11: Creare le utility per le date — dates.ts

**Goal:** Creare funzioni di utilità per manipolazione e formattazione date usate nel calcolo aging delle fatture.

**Files To Create:**
- `src/lib/dates.ts`

**Dependencies:** Task 1.3 (`date-fns` installato)

**Implementation:**
```typescript
import { format, differenceInCalendarDays, parseISO, isToday, isPast } from 'date-fns'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM dd, yyyy')
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy-MM-dd')
}

export function daysBetween(dateStr: string, referenceDate: Date = new Date()): number {
  return differenceInCalendarDays(referenceDate, parseISO(dateStr))
}

export function isDateOverdue(dueDateStr: string): boolean {
  const dueDate = parseISO(dueDateStr)
  return isPast(dueDate) && !isToday(dueDate)
}

export function isDateDueToday(dueDateStr: string): boolean {
  return isToday(parseISO(dueDateStr))
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
```

**Acceptance Criteria:**
- [ ] `formatDate('2026-06-14')` restituisce `"Jun 14, 2026"`
- [ ] `daysBetween('2026-05-14')` restituisce circa 31 (rispetto a oggi 2026-06-14)
- [ ] `isDateOverdue('2026-05-01')` restituisce `true`
- [ ] `isDateOverdue('2026-12-31')` restituisce `false`
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 1.12: Creare il modulo di encryption — encryption.ts

**Goal:** Implementare encrypt/decrypt AES-256-GCM per proteggere i token QuickBooks nel database.

**Files To Create:**
- `src/lib/encryption.ts`

**Dependencies:** Task 1.7 (`QB_TOKEN_ENCRYPTION_KEY` configurata in `.env.local`)

**Implementation:**
```typescript
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const keyHex = process.env.QB_TOKEN_ENCRYPTION_KEY
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('QB_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(keyHex, 'hex')
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  const [ivB64, tagB64, dataB64] = ciphertext.split(':')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid ciphertext format')
  }
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const data = Buffer.from(dataB64, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(data).toString('utf8') + decipher.final('utf8')
}
```

**Acceptance Criteria:**
- [ ] `encrypt('test-token')` restituisce una stringa con due caratteri `:`
- [ ] `decrypt(encrypt('test-token'))` restituisce `'test-token'`
- [ ] Chiamate multiple a `encrypt` con lo stesso input producono output diversi (IV random)
- [ ] `decrypt` con input malformato lancia un errore, non crasha silenziosamente
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Medium

---

### Task 1.13: Creare la classe AppError — errors.ts

**Goal:** Creare una classe di errore tipizzata per distinguere errori applicativi da errori di sistema nei catch block.

**Files To Create:**
- `src/lib/errors.ts`

**Dependencies:** nessuno

**Implementation:**
```typescript
export type ErrorCode =
  | 'QB_NOT_CONNECTED'
  | 'QB_TOKEN_EXPIRED'
  | 'QB_API_ERROR'
  | 'QB_AUTH_FAILED'
  | 'REPORT_FAILED'
  | 'AI_FAILED'
  | 'EXPORT_FAILED'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
    }
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
```

**Acceptance Criteria:**
- [ ] `new AppError('QB_NOT_CONNECTED', 'message')` crea un'istanza con `.code` e `.message`
- [ ] `isAppError(new AppError(...))` restituisce `true`
- [ ] `isAppError(new Error('generic'))` restituisce `false`
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 1.14: Configurare il font Inter nel layout root

**Goal:** Impostare il font Inter di Google Fonts come font di default dell'applicazione tramite `next/font`.

**Files To Modify:**
- `src/app/layout.tsx`

**Dependencies:** Task 1.1

**Implementation:**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'QB Invoice Analyzer',
  description: 'Outstanding invoice analysis powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
```

**Acceptance Criteria:**
- [ ] `npm run dev` si avvia senza errori
- [ ] Il font Inter è visibile nel browser (DevTools → Elements → `font-family`)
- [ ] Il metadata `title` è visibile nel tab del browser
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 1.15: Aggiungere il Toaster provider per le notifiche

**Goal:** Aggiungere il componente `Toaster` di sonner al layout root così che le notifiche toast siano disponibili in tutta l'applicazione.

**Files To Modify:**
- `src/app/layout.tsx`

**Dependencies:** Task 1.5 (sonner installato), Task 1.14

**Modification:** Aggiungere import e componente `<Toaster />` al layout:
```typescript
import { Toaster } from '@/components/ui/sonner'

// nel return, dopo {children}:
<Toaster position="top-right" richColors />
```

**Acceptance Criteria:**
- [ ] `<Toaster />` presente nel DOM quando si carica l'app
- [ ] `npm run dev` si avvia senza errori
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 1.16: Verificare la build di produzione

**Goal:** Confermare che il progetto compila correttamente per la produzione prima di procedere con lo sviluppo delle funzionalità.

**Files To Create/Modify:** nessuno

**Dependencies:** Tutti i task 1.1–1.15 completati

**Commands da eseguire in sequenza:**
```bash
npx tsc --noEmit
npm run build
```

**Acceptance Criteria:**
- [ ] `npx tsc --noEmit` → output: zero errori, zero warning TypeScript
- [ ] `npm run build` → completato con successo (exit code 0)
- [ ] `npm run build` → output mostra le route `/` correttamente
- [ ] Nessuna dipendenza mancante segnalata durante la build
- [ ] La cartella `.next/` viene creata

**Complexity:** Low

---

## Build Order — Phase 1

Eseguire i task nell'ordine esatto:

```
1.1  → Inizializzare Next.js (fondamenta)
1.2  → Configurare next.config.ts (sicurezza)
1.3  → Installare dipendenze npm
1.4  → Configurare shadcn/ui           [richiede 1.3]
1.5  → Installare componenti shadcn    [richiede 1.4]
1.6  → Creare .env.example             [parallelo — nessun prerequisito]
1.7  → Creare .env.local               [richiede 1.6 + account esterni]
1.8  → Configurare .gitignore          [richiede 1.1]
1.9  → Creare cn.ts                    [richiede 1.3]
1.10 → Creare currency.ts              [richiede 1.9]
1.11 → Creare dates.ts                 [richiede 1.3]
1.12 → Creare encryption.ts            [richiede 1.7]
1.13 → Creare errors.ts                [nessun prerequisito]
1.14 → Configurare layout.tsx          [richiede 1.1]
1.15 → Aggiungere Toaster              [richiede 1.5, 1.14]
1.16 → Verificare build produzione     [richiede tutti i task precedenti]
```

**Checkpoint Phase 1 — prima di procedere alla Phase 2:**
- [x] `npm run dev` → avvio senza errori
- [x] `npm run build` → build senza errori
- [x] `npx tsc --noEmit` → zero errori TypeScript
- [ ] `.env.local` compilato con tutti i valori reali *(richiede credenziali utente)*
- [ ] Repository git inizializzato, `.env.local` non tracciato *(richiede azione utente)*

---

## Phase 2 — Database & Supabase

---

### Task 2.1: Creare il client Supabase lato browser

**Goal:** Creare il client Supabase per uso nei Client Components, che legge le credenziali dalle variabili d'ambiente pubbliche.

**Files To Create:**
- `src/services/supabase/client.ts`

**Files To Modify:** nessuno

**Dependencies:** Task 1.7 (`.env.local` con `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Implementation:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Acceptance Criteria:**
- [ ] File esiste in `src/services/supabase/client.ts`
- [ ] La funzione `createClient` è esportata come named export
- [ ] `npx tsc --noEmit` passa senza errori
- [ ] Importabile con `import { createClient } from '@/services/supabase/client'`

**Complexity:** Low

---

### Task 2.2: Creare il client Supabase lato server

**Goal:** Creare il client Supabase per uso in Server Components, Server Actions e API Routes, con gestione dei cookie per le sessioni SSR.

**Files To Create:**
- `src/services/supabase/server.ts`

**Files To Modify:** nessuno

**Dependencies:** Task 2.1

**Implementation:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorato nei Server Components (read-only)
          }
        },
      },
    }
  )
}
```

**Acceptance Criteria:**
- [ ] File esiste in `src/services/supabase/server.ts`
- [ ] La funzione `createClient` è `async` e restituisce una Promise
- [ ] `npx tsc --noEmit` passa senza errori
- [ ] Importabile con `import { createClient } from '@/services/supabase/server'`

**Complexity:** Low

---

### Task 2.3: Creare il client Supabase con service role

**Goal:** Creare il client admin con service role key per operazioni privilegiate (es. insert su audit_logs bypassando RLS) usate solo server-side.

**Files To Create:**
- `src/services/supabase/admin.ts`

**Files To Modify:** nessuno

**Dependencies:** Task 1.7 (`SUPABASE_SERVICE_ROLE_KEY` configurata)

**Implementation:**
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
```

**Acceptance Criteria:**
- [ ] File esiste in `src/services/supabase/admin.ts`
- [ ] `supabaseAdmin` è esportato come named export (non default)
- [ ] Il file non importa nulla da `next/headers` (è un singleton, non async)
- [ ] `npx tsc --noEmit` passa senza errori
- [ ] **Non** usato in Client Components (solo server-side)

**Complexity:** Low

---

### Task 2.4: Abilitare le estensioni PostgreSQL su Supabase

**Goal:** Abilitare `pgcrypto` e `uuid-ossp` nel progetto Supabase, necessarie per la generazione di UUID e la crittografia.

**Files To Create:**
- `supabase/migrations/001_enable_extensions.sql`

**Dependencies:** Account Supabase con progetto attivo

**SQL:**
```sql
-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Come eseguire:** Incollare ed eseguire nel Supabase SQL Editor (Dashboard → SQL Editor → New query).

**Acceptance Criteria:**
- [ ] Nessun errore nell'esecuzione SQL
- [ ] In Supabase Dashboard → Database → Extensions: `pgcrypto` abilitato
- [ ] `SELECT gen_random_uuid()` eseguito in SQL Editor restituisce un UUID valido
- [ ] File `.sql` salvato in `supabase/migrations/` per documentazione

**Complexity:** Low

---

### Task 2.5: Creare la tabella `profiles`

**Goal:** Creare la tabella `profiles` che estende `auth.users` con dati applicativi, incluso il trigger di auto-creazione.

**Files To Create:**
- `supabase/migrations/002_create_profiles.sql`

**Dependencies:** Task 2.4

**SQL:**
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funzione e trigger per auto-creazione del profilo alla registrazione
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Acceptance Criteria:**
- [ ] Tabella `profiles` visibile in Supabase Dashboard → Table Editor
- [ ] Colonne: `id`, `email`, `full_name`, `created_at`
- [ ] FK verso `auth.users` con `ON DELETE CASCADE`
- [ ] Trigger `on_auth_user_created` presente in Database → Triggers
- [ ] Creando un utente da Supabase Dashboard → Auth → Users viene auto-creata una riga in `profiles`

**Complexity:** Low

---

### Task 2.6: Creare la tabella `quickbooks_connections`

**Goal:** Creare la tabella per memorizzare i token OAuth QuickBooks cifrati per ogni utente.

**Files To Create:**
- `supabase/migrations/003_create_quickbooks_connections.sql`

**Dependencies:** Task 2.5

**SQL:**
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
  disconnected_at       TIMESTAMPTZ,

  CONSTRAINT uq_user_realm UNIQUE (user_id, realm_id)
);

CREATE INDEX idx_qb_conn_user_id ON quickbooks_connections(user_id);
CREATE INDEX idx_qb_conn_active  ON quickbooks_connections(user_id, is_active);
```

**Acceptance Criteria:**
- [ ] Tabella `quickbooks_connections` visibile nel Table Editor
- [ ] Constraint UNIQUE su `(user_id, realm_id)` presente
- [ ] Entrambi gli indici creati (verificare in Database → Indexes)
- [ ] FK verso `profiles(id)` con `ON DELETE CASCADE`
- [ ] I campi `access_token` e `refresh_token` sono `TEXT` (memorizzano stringhe cifrate)

**Complexity:** Low

---

### Task 2.7: Creare la tabella `reports`

**Goal:** Creare la tabella per memorizzare i report generati con le metriche aggregate e il JSON delle fatture.

**Files To Create:**
- `supabase/migrations/004_create_reports.sql`

**Dependencies:** Task 2.6

**SQL:**
```sql
CREATE TABLE reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_from             DATE NOT NULL,
  date_to               DATE NOT NULL,
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Metriche aggregate (calcolate al momento della generazione)
  total_outstanding     NUMERIC(15,2),
  invoice_count         INTEGER,
  overdue_count         INTEGER,
  largest_debtor_name   TEXT,
  largest_debtor_amount NUMERIC(15,2),
  avg_days_outstanding  NUMERIC(8,2),

  -- Fatture cached come JSONB (MVP: evita tabella separata)
  invoices_json         JSONB NOT NULL DEFAULT '[]',

  -- AI output
  ai_summary            TEXT,
  ai_generated_at       TIMESTAMPTZ,

  -- Stato della generazione
  status                TEXT NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('generating', 'completed', 'failed')),
  error_message         TEXT
);

CREATE INDEX idx_reports_user_id        ON reports(user_id);
CREATE INDEX idx_reports_user_generated ON reports(user_id, generated_at DESC);
```

**Acceptance Criteria:**
- [ ] Tabella `reports` visibile nel Table Editor
- [ ] Colonna `invoices_json` di tipo `jsonb` con default `'[]'`
- [ ] CHECK constraint su `status` con i 3 valori validi
- [ ] Entrambi gli indici creati
- [ ] FK verso `profiles(id)` con `ON DELETE CASCADE`
- [ ] `SELECT * FROM reports LIMIT 1` non genera errori

**Complexity:** Low

---

### Task 2.8: Abilitare RLS sulla tabella `profiles`

**Goal:** Abilitare Row Level Security su `profiles` e creare le policy che permettono agli utenti di leggere e aggiornare solo il proprio profilo.

**Files To Create:**
- `supabase/migrations/005_rls_profiles.sql`

**Dependencies:** Task 2.5

**SQL:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

**Acceptance Criteria:**
- [ ] RLS abilitato su `profiles` (Supabase Dashboard → Table Editor → profiles → RLS: enabled)
- [ ] 2 policy presenti: `profiles_select_own`, `profiles_update_own`
- [ ] Testare con SQL Editor: `SET LOCAL role TO authenticated; SET LOCAL "request.jwt.claims" TO '{"sub": "uuid-diverso"}'; SELECT * FROM profiles;` → 0 righe
- [ ] Il trigger `handle_new_user` usa `SECURITY DEFINER` quindi bypassa RLS per l'insert (corretto)

**Complexity:** Low

---

### Task 2.9: Abilitare RLS sulla tabella `quickbooks_connections`

**Goal:** Abilitare RLS su `quickbooks_connections` con una policy all-in-one che permette agli utenti di gestire solo le proprie connessioni.

**Files To Create:**
- `supabase/migrations/006_rls_quickbooks_connections.sql`

**Dependencies:** Task 2.6

**SQL:**
```sql
ALTER TABLE quickbooks_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qb_connections_all_own"
  ON quickbooks_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Acceptance Criteria:**
- [ ] RLS abilitato su `quickbooks_connections`
- [ ] Policy `qb_connections_all_own` presente
- [ ] Un utente autenticato può fare SELECT solo sulle proprie righe
- [ ] Un utente non autenticato non può accedere alla tabella

**Complexity:** Low

---

### Task 2.10: Abilitare RLS sulla tabella `reports`

**Goal:** Abilitare RLS su `reports` con una policy all-in-one che permette agli utenti di gestire solo i propri report.

**Files To Create:**
- `supabase/migrations/007_rls_reports.sql`

**Dependencies:** Task 2.7

**SQL:**
```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_all_own"
  ON reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Acceptance Criteria:**
- [ ] RLS abilitato su `reports`
- [ ] Policy `reports_all_own` presente
- [ ] Un utente non può leggere i report di un altro utente
- [ ] `SELECT * FROM reports` con utente A non restituisce report di utente B

**Complexity:** Low

---

### Task 2.11: Generare i tipi TypeScript da Supabase

**Goal:** Generare il file dei tipi TypeScript che rispecchia lo schema del database, eliminando la necessità di definire manualmente i tipi delle tabelle.

**Files To Create:**
- `src/types/database.ts`

**Dependencies:** Task 2.5, 2.6, 2.7 (tutte le tabelle create)

**Command:**
```bash
npx supabase gen types typescript \
  --project-id YOUR_SUPABASE_PROJECT_ID \
  --schema public \
  > src/types/database.ts
```

Sostituire `YOUR_SUPABASE_PROJECT_ID` con l'ID trovato in Supabase Dashboard → Project Settings → General.

**In alternativa** (senza Supabase CLI installato), creare manualmente il file con i tipi base:

```typescript
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
        }
      }
      quickbooks_connections: {
        Row: {
          id: string
          user_id: string
          realm_id: string
          company_name: string
          access_token: string
          refresh_token: string
          access_token_expiry: string
          refresh_token_expiry: string
          is_active: boolean
          connected_at: string
          disconnected_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['quickbooks_connections']['Row'], 'id' | 'connected_at'>
        Update: Partial<Database['public']['Tables']['quickbooks_connections']['Insert']>
      }
      reports: {
        Row: {
          id: string
          user_id: string
          date_from: string
          date_to: string
          generated_at: string
          total_outstanding: number | null
          invoice_count: number | null
          overdue_count: number | null
          largest_debtor_name: string | null
          largest_debtor_amount: number | null
          avg_days_outstanding: number | null
          invoices_json: Json
          ai_summary: string | null
          ai_generated_at: string | null
          status: 'generating' | 'completed' | 'failed'
          error_message: string | null
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'generated_at'>
        Update: Partial<Database['public']['Tables']['reports']['Insert']>
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `src/types/database.ts` esiste con i tipi per le 3 tabelle
- [ ] `npx tsc --noEmit` passa senza errori
- [ ] I tipi `Row`, `Insert`, `Update` sono definiti per ogni tabella
- [ ] Il tipo `Json` è esportato correttamente

**Complexity:** Low

---

### Task 2.12: Verificare la connessione Supabase da Next.js

**Goal:** Confermare che il client Supabase si connette correttamente al database eseguendo una query di test da un API Route temporaneo.

**Files To Create:**
- `src/app/api/test-db/route.ts` *(temporaneo — da eliminare dopo il test)*

**Dependencies:** Task 2.1, 2.2, 2.11

**Implementation:**
```typescript
import { createClient } from '@/services/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    return NextResponse.json({ status: 'connected', data })
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 })
  }
}
```

**Test:** `curl http://localhost:3000/api/test-db`

**Acceptance Criteria:**
- [ ] La risposta è `{ "status": "connected", "data": [...] }` con status HTTP 200
- [ ] Nessun errore di connessione (CORS, URL mancante, chiave invalida)
- [ ] **Eliminare** `src/app/api/test-db/route.ts` dopo il test superato

**Complexity:** Low

---

## Build Order — Phase 2

Eseguire i task nell'ordine esatto:

```
2.1  → Client browser Supabase
2.2  → Client server Supabase         [richiede 2.1]
2.3  → Client admin Supabase          [richiede 1.7]
2.4  → Abilitare estensioni SQL       [richiede account Supabase]
2.5  → Creare tabella profiles        [richiede 2.4]
2.6  → Creare tabella qb_connections  [richiede 2.5]
2.7  → Creare tabella reports         [richiede 2.6]
2.8  → RLS su profiles                [richiede 2.5]
2.9  → RLS su qb_connections          [richiede 2.6]
2.10 → RLS su reports                 [richiede 2.7]
2.11 → Generare tipi TypeScript       [richiede 2.5, 2.6, 2.7]
2.12 → Verificare connessione         [richiede 2.1, 2.2, 2.11]
```

**Checkpoint Phase 2 — prima di procedere alla Phase 3:**
- [ ] 3 tabelle presenti in Supabase Dashboard → Table Editor
- [ ] RLS abilitato su tutte e 3 le tabelle
- [ ] `src/types/database.ts` esiste con tipi per le 3 tabelle
- [ ] `curl http://localhost:3000/api/test-db` risponde `status: connected`
- [ ] Route di test eliminata (`/api/test-db`)
- [ ] `npx tsc --noEmit` → zero errori

---

## Phase 3 — Authentication

---

### Task 3.1: Creare gli schemi Zod per autenticazione

**Goal:** Definire e validare la forma dei dati per login e registrazione con Zod, usati sia nei form client-side che nelle Server Actions.

**Files To Create:**
- `src/features/auth/schemas.ts`

**Files To Modify:** nessuno

**Dependencies:** Task 1.3 (`zod` installato)

**Implementation:**
```typescript
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export const RegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
```

**Acceptance Criteria:**
- [ ] `LoginSchema.safeParse({ email: 'a@b.com', password: '123' })` → `success: true`
- [ ] `LoginSchema.safeParse({ email: 'not-email', password: '' })` → `success: false` con 2 errori
- [ ] `RegisterSchema` rifiuta password senza maiuscole
- [ ] `RegisterSchema` rifiuta `confirmPassword` diverso da `password`
- [ ] I tipi `LoginInput` e `RegisterInput` sono esportati
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.2: Creare le Server Actions per autenticazione

**Goal:** Implementare `login`, `register` e `logout` come Server Actions che interagiscono con Supabase Auth e gestiscono redirect.

**Files To Create:**
- `src/actions/auth.ts`

**Files To Modify:** nessuno

**Dependencies:** Task 2.2 (client server Supabase), Task 3.1 (schemi Zod)

**Implementation:**
```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { LoginSchema, RegisterSchema } from '@/features/auth/schemas'

export async function login(prevState: any, formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Invalid email or password.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  redirect('/dashboard')
}

export async function register(prevState: any, formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message
    return { error: firstError ?? 'Registration failed.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

**Acceptance Criteria:**
- [ ] `login` con credenziali valide → redirect a `/dashboard`
- [ ] `login` con credenziali errate → ritorna `{ error: 'Invalid email or password.' }`
- [ ] `register` con email già in uso → ritorna messaggio di errore appropriato
- [ ] `register` con dati validi → redirect a `/dashboard`
- [ ] `logout` → redirect a `/login`
- [ ] Nessun messaggio di errore espone dettagli tecnici interni
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.3: Creare il middleware di autenticazione

**Goal:** Implementare il middleware Next.js che protegge le route autenticate e reindirizza gli utenti già autenticati lontano dalle pagine di auth.

**Files To Create:**
- `src/middleware.ts`

**Files To Modify:** nessuno

**Dependencies:** Task 2.2 (client server Supabase)

**Implementation:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/reports', '/ai-insights', '/settings']
const AUTH_PATHS = ['/login', '/register']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p))
  const isAuthPath = AUTH_PATHS.some((p) => path.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

**Acceptance Criteria:**
- [ ] Visitare `/dashboard` senza sessione → redirect a `/login`
- [ ] Visitare `/login` con sessione attiva → redirect a `/dashboard`
- [ ] Visitare `/` senza sessione → pagina carica normalmente (non protetta)
- [ ] Le route `/api/auth/*` non sono bloccate dal middleware
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.4: Creare la route callback per Supabase Auth

**Goal:** Implementare la route API che gestisce il callback OAuth di Supabase (necessaria per il flusso di email confirmation e OAuth providers).

**Files To Create:**
- `src/app/api/auth/callback/route.ts`

**Files To Modify:** nessuno

**Dependencies:** Task 2.2

**Implementation:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

**Acceptance Criteria:**
- [ ] Route risponde a `GET /api/auth/callback?code=...`
- [ ] Con codice valido → redirect a `/dashboard`
- [ ] Con codice mancante o invalido → redirect a `/login?error=auth_callback_failed`
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.5: Creare il layout per le pagine di autenticazione

**Goal:** Creare il layout condiviso per le pagine login e register: schermata centrata, logo e card container.

**Files To Create:**
- `src/app/(auth)/layout.tsx`

**Files To Modify:** nessuno

**Dependencies:** Task 1.5 (shadcn/ui), Task 1.14 (layout root)

**Implementation:**
```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">QB Invoice Analyzer</h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered accounts receivable</p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Navigando a `/login` la pagina è centrata verticalmente e orizzontalmente
- [ ] Il titolo "QB Invoice Analyzer" è visibile sopra il form
- [ ] Layout funziona su viewport 375px (mobile) e 1280px (desktop)
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.6: Creare la pagina di Login

**Goal:** Implementare la pagina `/login` con form validato, gestione errori e link alla registrazione. Usa `useActionState` per invocare la Server Action.

**Files To Create:**
- `src/app/(auth)/login/page.tsx`

**Files To Modify:** nessuno

**Dependencies:** Task 3.2 (Server Action login), Task 3.5 (layout auth), Task 1.5 (shadcn/ui)

**Implementation:**
```tsx
'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const initialState = { error: undefined as string | undefined }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {state.error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-sm text-slate-500 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

**Acceptance Criteria:**
- [ ] Pagina visibile a `/login`
- [ ] Submit con credenziali valide → redirect a `/dashboard`
- [ ] Submit con credenziali errate → messaggio di errore rosso visibile sotto il titolo
- [ ] Il bottone mostra "Signing in..." durante il pending
- [ ] Il bottone è disabilitato durante il pending (previene doppio submit)
- [ ] Link "Create one" naviga a `/register`
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.7: Creare la pagina di Registrazione

**Goal:** Implementare la pagina `/register` con form a 4 campi (nome, email, password, conferma password), validazione e messaggio di errore.

**Files To Create:**
- `src/app/(auth)/register/page.tsx`

**Files To Modify:** nessuno

**Dependencies:** Task 3.2 (Server Action register), Task 3.5 (layout auth), Task 1.5 (shadcn/ui)

**Implementation:**
```tsx
'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const initialState = { error: undefined as string | undefined }

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Start analyzing your outstanding invoices</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {state.error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-slate-400">Min 8 characters, 1 uppercase, 1 number</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create Account'}
          </Button>
          <p className="text-sm text-slate-500 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

**Acceptance Criteria:**
- [ ] Pagina visibile a `/register`
- [ ] Submit con dati validi → redirect a `/dashboard`
- [ ] Password con meno di 8 caratteri → errore visibile
- [ ] Password senza maiuscole → errore visibile
- [ ] `confirmPassword` diverso da `password` → errore visibile
- [ ] Email già registrata → errore visibile
- [ ] Il bottone è disabilitato durante il pending
- [ ] Link "Sign in" naviga a `/login`
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.8: Creare il layout per le pagine dashboard (autenticate)

**Goal:** Creare il layout root per tutte le pagine autenticate con sidebar di navigazione e header. Questo è lo shell dell'applicazione.

**Files To Create:**
- `src/app/(dashboard)/layout.tsx`

**Files To Modify:** nessuno

**Dependencies:** Task 3.3 (middleware), Task 2.2 (client server), Task 1.5 (shadcn/ui)

**Implementation:**
```tsx
import { createClient } from '@/services/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-700">
          <h1 className="text-sm font-semibold text-white">QB Invoice Analyzer</h1>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{profile?.email}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Sidebar visibile su `/dashboard`, `/reports`, `/settings`
- [ ] I 3 link di navigazione sono presenti e funzionanti
- [ ] L'email dell'utente è mostrata in fondo al logo nella sidebar
- [ ] Il bottone "Sign Out" esegue logout e reindirizza a `/login`
- [ ] Senza sessione → redirect a `/login` (doppio controllo oltre al middleware)
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.9: Creare una pagina dashboard placeholder

**Goal:** Creare una pagina `/dashboard` minimale che confermi il funzionamento del layout autenticato, prima di aggiungere la logica reale nella Phase 6.

**Files To Create:**
- `src/app/(dashboard)/dashboard/page.tsx`

**Files To Modify:** nessuno

**Dependencies:** Task 3.8 (layout dashboard)

**Implementation:**
```tsx
export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
      <p className="text-slate-500">
        Connect your QuickBooks account and generate a report to see your metrics here.
      </p>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Navigando a `/dashboard` da utente autenticato → pagina carica con sidebar
- [ ] Navigando a `/dashboard` da utente non autenticato → redirect a `/login`
- [ ] Testo placeholder visibile nella main area
- [ ] `npx tsc --noEmit` passa senza errori

**Complexity:** Low

---

### Task 3.10: Disabilitare la conferma email in Supabase (per il demo MVP)

**Goal:** Configurare Supabase per non richiedere la conferma email alla registrazione, permettendo ai nuovi utenti di accedere immediatamente. Necessario per il demo fluido.

**Files To Create/Modify:** nessuno — configurazione su Supabase Dashboard

**Dependencies:** Task 2.5 (tabella profiles e trigger)

**Steps:**
1. Aprire Supabase Dashboard → Authentication → Providers → Email
2. Disabilitare **"Confirm email"** (toggle off)
3. Salvare le modifiche

**Acceptance Criteria:**
- [ ] Dopo la registrazione l'utente viene reindirizzato a `/dashboard` senza ricevere una email
- [ ] Il trigger `handle_new_user` crea la riga in `profiles` correttamente
- [ ] In Supabase Dashboard → Auth → Users: il nuovo utente appare con `email_confirmed_at` valorizzato
- [ ] In Supabase Dashboard → Table Editor → profiles: la riga dell'utente esiste

**Complexity:** Low

---

### Task 3.11: Test end-to-end del flusso di autenticazione

**Goal:** Verificare manualmente che l'intero flusso di autenticazione funzioni correttamente dall'inizio alla fine.

**Files To Create/Modify:** nessuno

**Dependencies:** Task 3.1 → 3.10 tutti completati

**Test Script:**

```
SCENARIO 1 — Registrazione nuova
  1. Aprire http://localhost:3000/login in finestra incognito
  2. Cliccare "Create one"
  3. Compilare: nome, email nuova, password valida, conferma password
  4. Cliccare "Create Account"
  ATTESO: redirect a /dashboard con sidebar visibile

SCENARIO 2 — Logout e Login
  1. Cliccare "Sign Out" nella sidebar
  ATTESO: redirect a /login
  2. Inserire le stesse credenziali usate nella registrazione
  3. Cliccare "Sign In"
  ATTESO: redirect a /dashboard

SCENARIO 3 — Protezione route
  1. Aprire http://localhost:3000/dashboard in finestra incognito (senza login)
  ATTESO: redirect immediato a /login

SCENARIO 4 — Redirect utente autenticato
  1. Da utente loggato, navigare a http://localhost:3000/login
  ATTESO: redirect immediato a /dashboard

SCENARIO 5 — Credenziali errate
  1. Nella pagina login, inserire email valida ma password sbagliata
  2. Cliccare "Sign In"
  ATTESO: messaggio di errore rosso, nessun redirect

SCENARIO 6 — Validazione registrazione
  1. Provare a registrarsi con password "abc123" (no uppercase)
  ATTESO: messaggio di errore "Password must contain at least one uppercase letter"
```

**Acceptance Criteria:**
- [ ] Tutti e 6 gli scenari producono il risultato atteso
- [ ] Nessun errore in console durante i test
- [ ] Riga in `profiles` creata per ogni nuovo utente (verificare in Supabase Table Editor)

**Complexity:** Low

---

## Build Order — Phase 3

Eseguire i task nell'ordine esatto:

```
3.1  → Schemi Zod auth
3.2  → Server Actions login/register/logout    [richiede 3.1, 2.2]
3.3  → Middleware autenticazione               [richiede 2.2]
3.4  → Route callback Supabase Auth            [richiede 2.2]
3.5  → Layout pagine auth (centrato)           [richiede 1.5, 1.14]
3.6  → Pagina Login                            [richiede 3.2, 3.5]
3.7  → Pagina Register                         [richiede 3.2, 3.5]
3.8  → Layout pagine dashboard (sidebar)       [richiede 3.3, 2.2, 3.2]
3.9  → Pagina dashboard placeholder            [richiede 3.8]
3.10 → Disabilitare conferma email Supabase    [richiede 2.5]
3.11 → Test end-to-end flusso autenticazione   [richiede 3.1 → 3.10]
```

**Checkpoint Phase 3 — prima di procedere alla Phase 4:**
- [ ] Registrazione → login automatico → `/dashboard` con sidebar: funziona
- [ ] Logout → `/login`: funziona
- [ ] Rivisitare `/dashboard` senza sessione → redirect a `/login`: funziona
- [ ] Utente loggato che visita `/login` → redirect a `/dashboard`: funziona
- [ ] Riga `profiles` creata in Supabase per ogni utente registrato
- [ ] `npx tsc --noEmit` → zero errori TypeScript
