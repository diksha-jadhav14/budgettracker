#!/bin/bash

echo "🚀 Budget Tracker Setup Script"
echo "================================"
echo ""

# Check and fix .env file if it has wrong DATABASE_URL
if [ -f ".env" ]; then
    if grep -q "prisma+postgres" .env; then
        echo "🔧 Fixing incorrect DATABASE_URL in .env file..."
        echo 'DATABASE_URL="postgresql://budgetuser:budgetpass123@localhost:5432/budgettracker?schema=public"' > .env
        echo "✅ .env file fixed"
        echo ""
    fi
fi

# Ensure .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop first:"
    echo "  - Open Docker Desktop application"
    echo "  - Wait for it to start (you'll see the Docker icon in your menu bar)"
    echo "  - Then run this script again"
    echo ""
    
    # Try to open Docker Desktop on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Attempting to open Docker Desktop..."
        open -a Docker
        echo ""
        echo "⏳ Waiting for Docker to start (this may take 30-60 seconds)..."
        echo "   Press Ctrl+C to cancel and start manually"
        
        # Wait for Docker to be available (max 60 seconds)
        COUNTER=0
        until docker info > /dev/null 2>&1 || [ $COUNTER -eq 60 ]; do
            sleep 2
            COUNTER=$((COUNTER + 2))
            echo -n "."
        done
        echo ""
        
        if ! docker info > /dev/null 2>&1; then
            echo "❌ Docker did not start in time. Please start Docker Desktop manually and run this script again."
            exit 1
        fi
        
        echo "✅ Docker is now running!"
    else
        exit 1
    fi
fi

echo "✅ Docker is running"
echo ""

# Check if containers are already running
if docker-compose ps | grep -q "budgettracker-db.*Up"; then
    echo "✅ Database container is already running"
else
    echo "📦 Starting PostgreSQL database..."
    
    # Try to start, if it fails due to port conflict, try to remove old container
    if ! docker-compose up -d 2>&1; then
        echo ""
        echo "⚠️  Port 5432 is already in use. Attempting to resolve..."
        
        # Check if it's our old container
        if docker ps -a | grep -q "budgettracker-db"; then
            echo "🔧 Found old budgettracker-db container. Removing it..."
            docker-compose down
            docker-compose up -d
            
            if [ $? -ne 0 ]; then
                echo ""
                echo "❌ Still failed to start. Port 5432 is occupied by another process."
                echo ""
                echo "To fix this, choose one option:"
                echo ""
                echo "Option 1: Stop the existing PostgreSQL instance"
                echo "  - Find what's using port 5432:"
                echo "    lsof -i :5432"
                echo "  - Stop it or use a different port"
                echo ""
                echo "Option 2: Use a different port for this project"
                echo "  - Edit docker-compose.yml and change '5432:5432' to '5433:5432'"
                echo "  - Update .env.local DATABASE_URL to use port 5433"
                echo ""
                exit 1
            fi
        else
            echo ""
            echo "❌ Port 5432 is occupied by another process (not Docker)."
            echo ""
            echo "To fix this:"
            echo "1. Find what's using port 5432:"
            echo "   lsof -i :5432"
            echo ""
            echo "2. Either:"
            echo "   - Stop that PostgreSQL instance, OR"
            echo "   - Edit docker-compose.yml to use a different port (e.g., 5433:5432)"
            echo "   - Then update DATABASE_URL in .env.local to match"
            echo ""
            exit 1
        fi
    fi
    
    echo "⏳ Waiting for database to be ready..."
    sleep 5
fi

echo ""

# Check if database is healthy
echo "🔍 Checking database health..."
COUNTER=0
until docker-compose exec -T postgres pg_isready -U budgetuser -d budgettracker > /dev/null 2>&1 || [ $COUNTER -eq 30 ]; do
    sleep 1
    COUNTER=$((COUNTER + 1))
    echo -n "."
done
echo ""

if [ $COUNTER -eq 30 ]; then
    echo "⚠️  Database health check timed out, but continuing..."
else
    echo "✅ Database is healthy"
fi

echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo ""

# Push database schema
echo "📊 Setting up database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database schema"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Setup complete!"
echo ""
echo "You can now start the development server with:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  npm run db:studio  - Open database GUI"
echo "  docker-compose ps  - Check container status"
echo "  docker-compose logs - View database logs"
echo "================================"
