#!/bin/sh
# keep_alive.sh — Starts WSL services and keeps WSL alive
service redis-server start 2>/dev/null || true
service postgresql start 2>/dev/null || true
sleep 2
sudo -u postgres psql -c "ALTER USER \"user\" WITH PASSWORD 'password';" 2>/dev/null || true
sudo -u postgres psql -d startup_consultant -c "GRANT ALL ON SCHEMA public TO \"user\";" 2>/dev/null || true
echo "Services started. Keeping WSL alive..."
# Keep WSL alive indefinitely
tail -f /dev/null
