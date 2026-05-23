#!/bin/sh
# setup_wsl_env.sh — Creates Linux virtualenv and installs all requirements inside WSL

PROJ="/mnt/c/Users/sameer/OneDrive/Desktop/AI AGENT"
VENV_PATH="/root/venv_startup"

echo "=== Setting up Linux Python virtualenv ==="

# Start services first
service redis-server start 2>/dev/null || true
service postgresql start 2>/dev/null || true
sleep 2

# Fix DB
sudo -u postgres psql -c "ALTER USER \"user\" WITH PASSWORD 'password';" 2>/dev/null || true
sudo -u postgres psql -d startup_consultant -c "GRANT ALL ON SCHEMA public TO \"user\";" 2>/dev/null || true

# Install python3-venv if needed
echo "Installing python3-venv..."
apt-get install -y python3-venv python3-pip 2>&1 | tail -5

# Create Linux venv in home dir (not on Windows filesystem for performance)
if [ ! -f "$VENV_PATH/bin/activate" ]; then
    echo "Creating Linux venv at $VENV_PATH"
    python3 -m venv "$VENV_PATH" 2>&1
    echo "Venv created"
else
    echo "Linux venv already exists"
fi

# Activate
. "$VENV_PATH/bin/activate"
echo "Python: $(python --version)"

# Install core packages
echo "Installing core packages..."
pip install --quiet --no-cache-dir \
    "fastapi>=0.110.0" \
    "uvicorn[standard]>=0.27.0" \
    "python-multipart>=0.0.9" \
    "sqlalchemy>=2.0.0" \
    "asyncpg>=0.29.0" \
    "python-jose[cryptography]>=3.3.0" \
    "passlib[bcrypt]>=1.7.4" \
    "celery>=5.3.6" \
    "redis>=5.0.1" \
    "pydantic-settings>=2.2.0" \
    "python-dotenv>=1.0.0" \
    "email-validator>=2.1.0" \
    "structlog>=24.1.0" \
    "httpx>=0.27.0" \
    "tenacity>=8.2.3" \
    "langchain>=0.1.0" \
    "langchain-groq>=0.1.0" \
    "langchain-community>=0.0.29" \
    "cloudinary>=1.39.0" \
    "reportlab>=4.1.0" \
    "chromadb>=0.4.0" \
    "sentence-transformers>=2.7.0" \
    "PyMuPDF>=1.24.0" \
    "python-docx>=1.1.0" \
    "tavily-python>=0.3.0" \
    2>&1

echo "All packages installed"
python -c "import fastapi, asyncpg, celery, redis, chromadb; print('IMPORTS OK')" 2>&1

echo "=== Setup complete ==="
