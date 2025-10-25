# Budget Tracker Setup Guide

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration if needed. The default values work for local development.

### 3. Start PostgreSQL Database

Start the PostgreSQL database using Docker:

```bash
docker-compose up -d
```

Verify the database is running:

```bash
docker-compose ps
```

### 4. Run Database Migrations

Create the database schema:

```bash
npm run db:push
```

This command will:
- Create all tables defined in `prisma/schema.prisma`
- Set up the database structure for users, transactions, categories, etc.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## First Time Usage

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Get Started" or "Sign Up"
3. Create your account with email and password
4. You'll be automatically redirected to the dashboard

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database (for development)
- `npm run db:migrate` - Create and run migrations (for production)
- `npm run db:generate` - Generate Prisma Client
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Database Management

### View Database with Prisma Studio

```bash
npm run db:studio
```

This opens a visual interface at [http://localhost:5555](http://localhost:5555) to view and edit your database.

### Stop Database

```bash
docker-compose down
```

### Reset Database (Delete all data)

```bash
docker-compose down -v
npm run db:push
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard page
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── providers/     # React providers
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utility functions
│   └── types/             # TypeScript types
├── prisma/
│   └── schema.prisma      # Database schema
├── docker-compose.yml     # Docker configuration
└── .env.local            # Environment variables
```

## Features

### Phase 1: Authentication ✅
- User registration with email/password
- Secure login with NextAuth.js
- Session management
- Protected routes

### Phase 2: Dashboard ✅
- View total balance, income, and expenses
- Recent transactions list
- Spending by category visualization
- Minimal, clean UI with micro-interactions

### Coming Soon
- Add/Edit/Delete transactions
- Upload receipt images with OCR
- Budget insights and suggestions
- Export to CSV
- Category management

## Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Check if Docker is running:
   ```bash
   docker ps
   ```

2. Check if PostgreSQL container is healthy:
   ```bash
   docker-compose ps
   ```

3. Restart the database:
   ```bash
   docker-compose restart
   ```

### Port Already in Use

If port 5432 or 3000 is already in use:

- For database (port 5432): Edit `docker-compose.yml` and change the port mapping
- For Next.js (port 3000): Run `npm run dev -- -p 3001` to use a different port

### Authentication Issues

If you can't log in:

1. Clear browser cookies and local storage
2. Check if `.env.local` has `NEXTAUTH_SECRET` set
3. Restart the development server

## Security Notes

- Change `NEXTAUTH_SECRET` in production to a secure random string
- Never commit `.env.local` to version control
- Use strong passwords for production databases
- Keep dependencies up to date

## Need Help?

Check the following resources:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [shadcn/ui Documentation](https://ui.shadcn.com)
