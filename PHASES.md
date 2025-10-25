# Expense Tracker App — Development Phases (Next.js + shadcn + TypeScript)

## 🎯 Overview

A simple personal finance app built with **Next.js**, **TypeScript**, and **shadcn/ui**. It helps users:

* Track income and expenses.
* Upload receipts or transaction screenshots.
* Automatically detect whether an image represents a credit (income) or debit (expense).
* Get basic budget insights and monthly summaries.

The focus: clean UI, minimal setup, and simple backend logic.

---

## 🧱 Phase 0 — Setup & Project Foundation

**Goal:** Initialize the base project with the essential tools and structure.

**Tasks:**

* Create Next.js project (`npx create-next-app@latest --typescript`).
* Setup **TailwindCSS** and **shadcn/ui**.
* Configure **Prisma** with SQLite for local data.
* Create basic folder structure: `/app`, `/components`, `/lib`, `/api`.

**What to avoid:**

* Don’t over-engineer backend logic yet.
* No need for authentication at this stage.

---

## 🔐 Phase 1 — Authentication & User System

**Goal:** Add a minimal auth system for user sessions.

**Tasks:**

* Integrate **NextAuth.js** (with credentials or Google provider).
* Create basic `/login` and `/register` pages using shadcn components.
* Add session-based access control (redirect to login if unauthenticated).

**Optional:** Use Prisma adapter for NextAuth to persist user sessions.

**What to avoid:**

* Complex roles or permissions.
* Multi-tenant setups.

---

## 🏠 Phase 2 — Dashboard / Home Page

**Goal:** Build the main dashboard showing balance and recent transactions.

**Tasks:**

* Create `/dashboard` route.
* Show total balance, total income, total expenses.
* Display a list of recent transactions.
* Add a button or modal to manually add new transactions.

**UI Components:**

* `Card`, `Button`, `Dialog`, `Table` (from shadcn).

**What to avoid:**

* Graphs/charts for now (add later in Phase 4).

---

## 📤 Phase 3 — Image Upload & OCR Detection

**Goal:** Enable uploading an image and auto-detecting credit/debit type.

**Tasks:**

* Create `/upload` page.
* Build image upload form using `react-hook-form`.
* Handle uploads via `/api/upload` route.
* Use **tesseract.js** to extract text.
* Implement rule-based parser to detect amount & transaction type.
* Allow user to confirm or edit extracted data before saving.

**What to avoid:**

* Don’t implement ML models — keep it rule-based.
* No need for cloud storage yet — local `/public/uploads` is fine.

---

## 💰 Phase 4 — Budget Insights & Suggestions

**Goal:** Provide simple insights and spending tips.

**Tasks:**

* Analyze past transactions for spending trends.
* Compute monthly totals and simple budget comparison.
* Generate basic text-based suggestions (e.g., “You spent 30% more on dining this month”).

**What to avoid:**

* Advanced analytics or predictive models.

---

## 📱 Phase 5 — Polish & Optional Additions

**Goal:** Improve UI/UX and add optional features.

**Tasks:**

* Add charts (using `recharts` or similar) for income/expense visualization.
* Add category filters and search.
* Make UI responsive and mobile-friendly.
* Prepare for deployment on **Vercel**.

**Optional Add-ons:**

* CSV export.
* Budget goals per category.
* Multi-currency support.

---

## ✅ Summary Roadmap

| Phase | Focus     | Output                       |
| ----- | --------- | ---------------------------- |
| 0     | Setup     | Ready-to-code base project   |
| 1     | Auth      | Login/Register working       |
| 2     | Dashboard | Manual transaction tracking  |
| 3     | Upload    | OCR-based transaction input  |
| 4     | Budget    | Suggestions & summaries      |
| 5     | Polish    | Charts, filters, mobile view |

---

Next step → Start with **Phase 0 (Setup)** by initializing the Next.js app, adding Tailwind + shadcn, and creating the basic folder layout.
