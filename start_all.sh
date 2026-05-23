#!/bin/sh
# start_all.sh — runs all services + FastAPI + Celery inside WSL

# 1. Start data services
service redis-server start 2>/dev/null || true
service postgresql start 2>/dev/null || true
sleep 2

# 2. Ensure DB and user setup
sudo -u postgres psql -c "ALTER USER \"user\" WITH PASSWORD 'password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE startup_consultant OWNER \"user\";" 2>/dev/null || true
sudo -u postgres psql -d startup_consultant -c "GRANT ALL ON SCHEMA public TO \"user\";" 2>/dev/null || true

# 3. Verify connectivity
echo "Redis: $(redis-cli ping)"
echo "PG: $(PGPASSWORD=password psql -U user -h 127.0.0.1 -d startup_consultant -c 'SELECT 1;' 2>&1 | grep -o '1 row\|error\|connect' | head -1)"

# 4. Set up Python env
PROJ_DIR="/mnt/c/Users/sameer/OneDrive/Desktop/AI AGENT"
cd "$PROJ_DIR"
export PYTHONPATH="$PROJ_DIR"

# Use the Windows venv Python
PYTHON="$PROJ_DIR/venv/Scripts/python.exe"

# 5. Init DB tables
$PYTHON -c "
import asyncio, sys
sys.path.insert(0, '.')
async def init():
    from backend.models import Base, User, Job, UserMemory
    from backend.database import engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('DB tables OK')
    await engine.dispose()
asyncio.run(init())
" 2>&1

echo "All setup complete"
