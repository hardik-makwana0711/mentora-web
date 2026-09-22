#!/bin/bash
set -e
cd /home/ec2-user/mentora-web

# Fetch latest changes from GitHub
git fetch origin main > /dev/null 2>&1

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date)] New commit detected ($LOCAL -> $REMOTE). Pulling and rebuilding container..."
    git pull origin main

    # .env must already exist here with the real production VITE_* values —
    # it is never committed to git (see deploy/DOCKER.md). docker-compose.yml
    # reads it automatically to build the image.
    if [ ! -f .env ]; then
        echo "[$(date)] ERROR: .env is missing on the server. See deploy/DOCKER.md." >&2
        exit 1
    fi

    docker compose build
    docker compose up -d
    docker image prune -f

    echo "[$(date)] Auto-deployment finished successfully!"
fi
