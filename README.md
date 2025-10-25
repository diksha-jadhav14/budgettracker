# 💰 Budget Tracker

A modern expense tracking app built with Next.js, TypeScript, PostgreSQL, and shadcn/ui.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# One-command setup (starts Docker, database, and migrations)
npm run setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✨ Features

- 🔐 **Secure Authentication** - Email/password login with NextAuth.js
- 📊 **Dashboard** - View balance, income, and expenses at a glance
- 💳 **Transaction Tracking** - Monitor all your financial activities
- 📸 **Image Upload & OCR** - Upload receipts and auto-extract transaction data with Tesseract.js
- 📈 **Category Insights** - Visual spending breakdown by category
- 🎨 **Modern UI** - Clean, minimal design with smooth animations
- 📱 **Responsive** - Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS 4, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Docker), Prisma ORM
- **Auth**: NextAuth.js with JWT sessions
- **Security**: bcryptjs password hashing

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Fast setup guide
- [SETUP.md](./SETUP.md) - Detailed setup and troubleshooting
- [PHASES.md](./PHASES.md) - Development roadmap

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup        # One-command setup (Docker + DB)
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
```

## 🎯 Current Status

- ✅ Phase 0: Project setup
- ✅ Phase 1: Authentication system
- ✅ Phase 2: Dashboard with demo data
- ✅ Phase 3: Transaction CRUD & Image upload with OCR
- 🔜 Phase 4: Budget insights
- 🔜 Phase 5: Charts, filters, exports

## 🐛 Troubleshooting

**Port 5432 already in use?**
```bash
docker-compose down
docker rm -f budgettracker-db
npm run setup
```

**Docker not starting?**
```bash
# Make sure Docker Desktop is open, then:
npm run setup
```

**Database connection issues?**
```bash
docker-compose restart
npm run db:push
```

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT
