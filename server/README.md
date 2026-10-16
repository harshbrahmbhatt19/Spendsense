# SpendSense — Backend

The complete backend from the spec is built: TypeScript + Express + Mongoose,
clean folder structure (`config/controllers/services/models/routes/middleware
/utils/validators/jobs`). Type-checks clean (`npx tsc --noEmit`) and boots
successfully once pointed at a real MongoDB URI.

## What's built

- **Auth** — simplified as requested: login is a chosen `userId` (like a
  username) + password, no email required. JWT in an httpOnly cookie, bcrypt
  hashing, rate-limited login/register endpoints.
- **Users** — currency/theme/monthly income goal/savings target/month-start
  preferences.
- **Accounts (wallets)** — full CRUD + inter-account transfers that correctly
  adjust both balances and log a `transfer` transaction. Deletion is blocked
  while transactions reference the account.
- **Categories** — full CRUD; every new user gets the default income/expense
  category set from the spec seeded automatically on register. Default
  categories can't be deleted; categories in use by a transaction or budget
  can't be deleted either.
- **Transactions** — full CRUD, duplicate, filtered/paginated list (search,
  date range, amount range, category, account, type, sort). Balances stay in
  sync automatically, including reversing the old effect on edit/delete.
- **Budgets** — overall or per-category, monthly or yearly, with live
  progress (spent/remaining/% used) computed against real transactions and a
  status of on_track/50/75/90/exceeded.
- **Savings goals** — add/withdraw money, automatic completion detection with
  a celebratory notification, progress percentage.
- **Recurring transactions** — daily/weekly/monthly/yearly frequencies, a
  daily cron job (`node-cron`, 00:05) that auto-creates due transactions and
  rolls `nextOccurrence` forward, upcoming-occurrence preview.
- **Bill reminders** — CRUD, an `/upcoming` endpoint (due within 7 days), and
  the same daily job auto-marks reminders overdue.
- **Notifications** — list with unread count, mark one/all read, delete.
  Goal completion currently generates one automatically.
- **Analytics** — dashboard summary (balance, income/expense/savings with
  month-over-month %, last 6 months, category breakdown), a full analytics
  overview endpoint (category breakdowns, spending trend, highest
  transactions, average daily expense), and a GitHub-style spending heatmap.
- **Rule-based insights engine** — runs entirely on real aggregated data
  (month-over-month change, savings trend, top category, weekend vs weekday
  spending, budget threshold warnings) before anything touches the AI.
- **Expense prediction** — 3-month rolling average, both total and
  per-category, structured so a real ML model can be swapped in later
  without touching callers.
- **Financial health score (0–100)** — weighted blend of savings rate,
  budget adherence, expense consistency, and an emergency-savings proxy,
  each with a rating and a plain-language explanation.
- **AI Financial Assistant (Groq)** — backend aggregates a compact JSON
  financial summary first (never raw transaction dumps) and sends only that
  to Groq, with a system prompt that forbids inventing data and forbids
  investment advice. Conversation history is stored in MongoDB per user.
- **Receipt scanning** — authenticated users can upload a JPG, PNG, or WebP
  receipt up to 8 MB. Local OCR extracts the receipt text, then the configured
  Groq text model turns it into a transaction draft for review;
  the transaction is only created after the user confirms it in the frontend.
- **Reports** — monthly, yearly, or custom date range; JSON summary endpoint
  plus a CSV export endpoint. (PDF export isn't built yet — flag it if you
  want it added.)
- **Global search** — transactions, categories, accounts, goals by name/title.
- Global error handler, 404 handler, zod request validation, helmet, CORS,
  rate limiting (including a tighter limit on the AI endpoint).

## Not built yet

The entire frontend (React/Vite/Tailwind/shadcn — 16 pages), and PDF report
export. See `/areas/spendsense.md` in project notes. Tell me which to build
next.

## Running it

```bash
cd server
npm install
cp .env.example .env   # fill in your real MongoDB URI, JWT secret, Groq key
npm run dev
```

Health check: `GET http://localhost:8080/api/health`

## Database encryption

For production, use MongoDB Atlas and enable **Encryption at Rest** with a
customer-managed KMS key. This encrypts every collection, index, journal, and
backup while preserving the queries required by analytics and reports. Atlas
connections must use TLS; the server enables TLS automatically when
`NODE_ENV=production`, or when `MONGODB_TLS=true` is set explicitly.

Do not put encryption keys in the repository. Store the Atlas KMS credentials
and application secrets in the deployment secret manager, rotate them there,
and verify Atlas auditing and backup encryption are enabled.

## API so far

```
POST   /api/auth/register        { name, userId, password }
POST   /api/auth/login           { userId, password }
POST   /api/auth/logout
GET    /api/auth/me

PATCH  /api/users/me             { name?, currency?, monthlyIncomeGoal?, savingsTarget?, monthStartDate?, theme? }
POST   /api/users/change-password { currentPassword, newPassword }

POST   /api/accounts
GET    /api/accounts
GET    /api/accounts/:id
PATCH  /api/accounts/:id
DELETE /api/accounts/:id
GET    /api/accounts/:id/history
POST   /api/accounts/transfer    { fromAccountId, toAccountId, amount, notes? }

POST   /api/categories
GET    /api/categories           ?type=income|expense
PATCH  /api/categories/:id
DELETE /api/categories/:id

POST   /api/transactions
GET    /api/transactions         ?page&limit&type&categoryId&accountId&search&dateFrom&dateTo&amountMin&amountMax&sortBy&sortOrder
GET    /api/transactions/:id
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
POST   /api/transactions/:id/duplicate
```

All routes except `/api/auth/register` and `/api/auth/login` require the
`token` cookie (or `Authorization: Bearer <token>`) set by login/register.
