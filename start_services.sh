#!/bin/sh
# Start services
service redis-server start 2>/dev/null || true
service postgresql start 2>/dev/null || true

# Wait for them to be ready
sleep 2

# Fix DB user and create database if not exists
sudo -u postgres psql -c "ALTER USER \"user\" WITH PASSWORD 'password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE startup_consultant OWNER \"user\";" 2>/dev/null || true
sudo -u postgres psql -d startup_consultant -c "GRANT ALL ON SCHEMA public TO \"user\";" 2>/dev/null || true

# Show status
echo "=== Services ==="
service redis-server status 2>&1 | grep -E "Active|running|stopped" | head -1
service postgresql status 2>&1 | grep -E "Active|running|stopped" | head -1

echo "=== Ports ==="
ss -tlnp | grep -E ":5432|:6379"

echo "=== Redis ping ==="
redis-cli ping

echo "=== PG connect ==="
PGPASSWORD=password psql -U user -h 127.0.0.1 -d startup_consultant -c "SELECT 1;" 2>&1 | head -3

echo "ready"
