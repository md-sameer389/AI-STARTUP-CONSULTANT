#!/bin/sh
# launch_backend.sh — runs inside WSL Ubuntu

PROJ="/mnt/c/Users/sameer/OneDrive/Desktop/AI AGENT"
VENV="$PROJ/venv/Scripts/python.exe"
UV="$PROJ/venv/Scripts/uvicorn.exe"

# 1. Start services
service redis-server start 2>/dev/null || true
service postgresql start 2>/dev/null || true
sleep 2

# 2. Fix DB user
sudo -u postgres psql -c "ALTER USER \"user\" WITH PASSWORD 'password';" 2>/dev/null || true
sudo -u postgres psql -d startup_consultant -c "GRANT ALL ON SCHEMA public TO \"user\";" 2>/dev/null || true

# 3. Verify
echo "Redis: $(redis-cli ping)"
echo "PG: $(PGPASSWORD=password psql -U user -h 127.0.0.1 -d startup_consultant -c 'SELECT 1;' 2>&1 | grep -o '1 row\|error' | head -1)"

# 4. Use Windows Python/uvicorn to start FastAPI on 0.0.0.0:8000
# This makes it accessible from Windows too
cd "$PROJ"
export PYTHONPATH="$PROJ"
export DATABASE_URL="postgresql+asyncpg://user:password@127.0.0.1:5432/startup_consultant?ssl=disable"
export REDIS_URL="redis://127.0.0.1:6379/0"

echo "Starting FastAPI on port 8000..."
"$UV" backend.main:app --host 0.0.0.0 --port 8000 --reload
