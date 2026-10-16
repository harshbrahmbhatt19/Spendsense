# SpendSense — Frontend

React + TypeScript + Vite + Tailwind CSS v4. Type-checks and builds clean
(`npm run build`).

## Design

Warm paper background, deep emerald accent (money/growth), amber for
warnings, brick for over-budget/destructive states. Newsreader (serif) for
headings and big financial figures, Inter for UI text. Deliberately not a
generic rounded-card SaaS template — category colors from your own data do
most of the visual work.

## Running it

```bash
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:8080` (see `vite.config.ts`),
so run the backend alongside it.

For a deployed frontend, set `VITE_API_URL` to the backend API origin, for
example `https://spendsens.onrender.com/api`, before building and redeploying.

## What's built

- **Auth** — login/register matching the simplified `userId` + password backend
- **Dashboard** — balance, income/expense/savings with month-over-month %,
  6-month bar chart, category donut, insight cards, recent transactions
- **Transactions** — search, filters (type/category/account), pagination,
  add/edit/duplicate/delete, all wired to the real API
- **Accounts** — cards with live balances, add account, inter-account transfer
- **Budgets & Goals** (tabbed) — budget progress bars with status color,
  goal cards with add-money and completion state
- **Analytics** — totals, category donut, financial health score, expense
  prediction, GitHub-style spending heatmap, highest transactions
- **AI Assistant** — chat UI wired to the Groq-backed `/ai/ask` endpoint,
  with starter question suggestions
- **Settings** (tabbed) — Profile (now saves for real via `PATCH /users/me`,
  plus a working change-password form), Categories (full CRUD), Recurring
  transactions, Reminders, Reports (generate + CSV/PDF export)
- **Notifications panel** — bell icon in the header, unread badge, mark
  one/all read, delete, polls every 60s
- **Global search** — ⌘K / Ctrl+K command palette across transactions,
  categories, accounts, and goals
- **Dark mode toggle** — moon/sun button in the header, flips the design
  token palette (paper/ink/line/soft-accent colors) app-wide
- Loading skeletons, empty states, error states, toast notifications,
  confirmation dialogs on every destructive action
- Responsive: collapsible desktop sidebar, mobile bottom nav + floating
  add-transaction button, no horizontal overflow at 320px+

## Known limitation

Dark mode flips the shared design tokens (backgrounds, text, borders,
accent-soft colors), but a handful of form inputs across the app use a
hardcoded `bg-white` for the input fill rather than a token, so those
specific fields stay light-colored in dark mode. Cosmetic only — nothing is
broken or unreadable — but worth a pass if pixel-perfect dark mode matters
for your use case.
