# 🔧 Troubleshooting Guide

## Port 5432 Already in Use

If you see this error:
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

### Solution 1: Remove Old Containers (Recommended)

```bash
# Stop and remove all containers
docker-compose down

# Remove any orphaned containers
docker ps -a | grep budgettracker

# If you see any, remove them
docker rm -f budgettracker-db

# Now run setup again
npm run setup
```

### Solution 2: Use a Different Port

If you have another PostgreSQL running on port 5432 and want to keep it:

1. **Edit `docker-compose.yml`:**
   ```yaml
   ports:
     - '5433:5432'  # Change from 5432:5432 to 5433:5432
   ```

2. **Edit `.env.local`:**
   ```
   DATABASE_URL="postgresql://budgetuser:budgetpass123@localhost:5433/budgettracker?schema=public"
   ```
   (Change port from 5432 to 5433)

3. **Run setup:**
   ```bash
   npm run setup
   ```

### Solution 3: Find and Stop the Process Using Port 5432

```bash
# Find what's using the port
lsof -i :5432

# If it's a PostgreSQL process you don't need:
# Find the PID from the output above, then:
kill -9 <PID>

# Then run setup again
npm run setup
```

---

## Docker Not Running

If you see:
```
Cannot connect to the Docker daemon
```

### Solution:

1. **Open Docker Desktop**
   - Find Docker Desktop in your Applications
   - Open it and wait for it to fully start
   - Look for the Docker icon in your menu bar (top right)
   - Wait until it says "Docker Desktop is running"

2. **Verify Docker is running:**
   ```bash
   docker ps
   ```
   If this works, Docker is running.

3. **Run setup again:**
   ```bash
   npm run setup
   ```

---

## Wrong Port Numbers (51213, 51214, etc.)

If you see errors mentioning ports like 51213 or 51214:

```bash
# This is from an auto-generated Prisma config
# Fix it by running:
npm run setup

# Or manually fix .env file:
echo 'DATABASE_URL="postgresql://budgetuser:budgetpass123@localhost:5432/budgettracker?schema=public"' > .env
npm run db:push
```

---

## Database Connection Failed

If the app can't connect to the database:

```bash
# Check if container is running
docker ps

# If not running, start it
docker-compose up -d

# Check container logs
docker-compose logs

# Restart the container
docker-compose restart

# Run migrations again
npm run db:push
```

---

## Prisma Client Errors

If you see errors about Prisma Client:

```bash
# Regenerate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

---

## Clean Start (Nuclear Option)

If nothing else works, start completely fresh:

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Run setup
npm run setup

# Start the app
npm run dev
```

---

## Port 3000 Already in Use

If Next.js port is taken:

```bash
# Use a different port
npm run dev -- -p 3001

# Then open http://localhost:3001
```

---

## Authentication Issues

If you can't log in:

1. **Clear browser data:**
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear cookies and local storage for localhost

2. **Check environment variables:**
   ```bash
   # Make sure .env.local exists and has NEXTAUTH_SECRET
   cat .env.local
   ```

3. **Restart dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

---

## Docker Desktop Not Installed

Download and install Docker Desktop:
- **macOS**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **Linux**: https://docs.docker.com/desktop/install/linux-install/

---

## Still Having Issues?

1. **Check the logs:**
   ```bash
   # Docker logs
   docker-compose logs
   
   # Next.js console output
   # (Check your terminal where npm run dev is running)
   ```

2. **Verify all services:**
   ```bash
   # Check Docker containers
   docker ps
   
   # Check if port 5432 is open
   lsof -i :5432
   
   # Check if Node is working
   node --version
   npm --version
   ```

3. **Try the manual setup:**
   See [SETUP.md](./SETUP.md) for step-by-step instructions.
