# 🚀 Quick Start Guide

## One-Command Setup

Just run this single command:

```bash
npm run setup
```

This will:
- ✅ Check if Docker is running (and try to start it on macOS)
- ✅ Start the PostgreSQL database container
- ✅ Setup the database schema
- ✅ Generate Prisma Client

Then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Manual Setup (Alternative)

If you prefer to run steps manually:

#### 1. Start Docker Desktop
Make sure Docker Desktop is running. Download from [docker.com](https://www.docker.com/products/docker-desktop/)

#### 2. Start the Database
```bash
docker-compose up -d
```

#### 3. Setup the Database Schema
```bash
npm run db:push
```

#### 4. Start the Development Server
```bash
npm run dev
```

#### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

---

## ✨ What's Been Built

### ✅ Phase 1: Authentication & User System
- **Login Page** (`/auth/login`) - Sign in with email and password
- **Register Page** (`/auth/register`) - Create a new account
- **Secure Authentication** - Using NextAuth.js with session management
- **Protected Routes** - Dashboard requires authentication

### ✅ Phase 2: Dashboard / Home Page
- **Landing Page** (`/`) - Beautiful landing page with features showcase
- **Dashboard** (`/dashboard`) - Main interface showing:
  - Total Balance, Income, and Expenses cards with animations
  - Recent transactions list with type indicators
  - Spending by category with progress bars
  - Minimal, modern design with micro-interactions
  - Responsive layout for mobile and desktop

### 🔧 Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: shadcn/ui components, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Docker), Prisma ORM
- **Authentication**: NextAuth.js with JWT sessions
- **Password Hashing**: bcryptjs

### 🎨 Design Features
- Gradient backgrounds
- Smooth hover animations
- Card hover effects with elevation
- Loading spinners
- Responsive design
- Dark mode support (via shadcn)
- Minimal, clean aesthetic

---

## 🧪 Testing the App

### Test the Authentication Flow

1. **Create an Account**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Click "Get Started" or "Sign Up"
   - Fill in your details (use any email format like `test@example.com`)
   - Password must be at least 6 characters
   - Click "Create account"

2. **Automatic Login**
   - After registration, you'll be automatically logged in
   - You'll be redirected to the dashboard

3. **View Dashboard**
   - See your balance summary (currently showing demo data)
   - View recent transactions (demo data)
   - Check spending by category (demo data)

4. **Logout**
   - Click the "Logout" button in the header
   - You'll be redirected to the login page

5. **Login Again**
   - Go to [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
   - Enter your email and password
   - Click "Sign in"
   - You'll be back in the dashboard

---

## 📦 What's Next (Upcoming Features)

Based on your PHASES.md plan:

### Phase 3: Image Upload & OCR Detection
- Upload receipt/transaction screenshots
- Auto-detect transaction type (income/expense)
- Extract amount using OCR (tesseract.js)
- Confirm and save transactions

### Phase 4: Budget Insights & Suggestions
- Spending trend analysis
- Monthly budget comparison
- AI-powered suggestions
- Category-wise insights

### Phase 5: Polish & Optional Features
- Interactive charts (using recharts)
- Category filters and search
- CSV export functionality
- Budget goals per category
- Multi-currency support

---

## 🛠️ Current Database Schema

Your database includes:

- **User** - Authentication and profile
- **Account** - OAuth providers (for future Google login)
- **Session** - User sessions
- **Transaction** - Income and expenses records
- **Category** - Organization for transactions
- **TransactionType** - Enum: INCOME or EXPENSE

---

## 💡 Tips

- The dashboard currently shows **demo data** for visualization
- Next step: Add functionality to create, edit, and delete real transactions
- All shadcn components are already installed and ready to use
- The database schema is designed to support all features in your PHASES.md

---

## 🐛 Troubleshooting

### Port 5432 Already in Use?

```bash
# Stop any existing containers
docker-compose down

# Remove old container if exists
docker rm -f budgettracker-db

# Run setup again
npm run setup
```

### Docker Not Running?

1. Open Docker Desktop application
2. Wait for it to start completely
3. Run `npm run setup` again

### Other Issues?

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions to common problems.

**Quick fixes:**
- **Database issues**: `docker-compose restart && npm run db:push`
- **Port 3000 in use**: `npm run dev -- -p 3001`
- **Clean start**: `docker-compose down -v && npm run setup`

---

## 📚 Documentation

For detailed setup and troubleshooting, see [SETUP.md](./SETUP.md)

For project phases and roadmap, see [PHASES.md](./PHASES.md)
