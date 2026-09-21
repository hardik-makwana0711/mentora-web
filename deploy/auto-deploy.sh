#!/bin/bash
set -e
cd /home/ec2-user/mentora-web

# Fetch latest changes from GitHub
git fetch origin main > /dev/null 2>&1

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date)] New commit detected ($LOCAL -> $REMOTE). Pulling and building..."
    git pull origin main

    # Ensure .env.production exists
    if [ ! -f .env.production ]; then
        cat << 'EOF' > .env.production
VITE_API_BASE_URL=https://api.mentoratr.com
VITE_APP_ENV=production
VITE_APP_NAME=Mentora
VITE_SOCKET_URL=https://api.mentoratr.com
VITE_SENTRY_DSN=
EOF
    fi

    # Install dependencies and required Linux native binary
    npm ci --include=optional || npm install --include=optional

    # Build production bundle
    npm run build

    # Deploy to Nginx root
    cp -r dist/* /var/www/mentora-web/dist/
    sudo chmod -R 755 /var/www
    echo "[$(date)] Auto-deployment finished successfully!"
fi
