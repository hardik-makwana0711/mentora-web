# Docker deployment — what lives where

mentora-web now runs as a Docker container on the EC2 instance instead of a
bare `npm run build` + copy-to-nginx-root. The build happens **inside Docker,
on the server**, so the server's own `.env` supplies the production
`VITE_*` values — they never need to be typed into GitHub.

## What's committed to GitHub (already done — nothing more to add)

These are generic, contain no secrets, and are safe in the public repo:

- [`Dockerfile`](../Dockerfile) — multi-stage build: Node builds the app, Nginx serves it
- [`.dockerignore`](../.dockerignore) — keeps `node_modules`, `.env`, `.git` etc. out of the image
- [`docker-compose.yml`](../docker-compose.yml) — builds the image and runs it on `127.0.0.1:8080`
- [`deploy/nginx.docker.conf`](nginx.docker.conf) — Nginx config **inside** the container (plain HTTP, SPA fallback)
- [`deploy/mentora-web.conf`](mentora-web.conf) — Nginx config **on the host**: terminates TLS for mentoratr.com and reverse-proxies to the container
- [`deploy/auto-deploy.sh`](auto-deploy.sh) — the script the server's systemd timer runs every minute to pull + rebuild
- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — on push to `main`, SSHes into EC2 and triggers the same rebuild immediately (references secrets by name only, no values)
- [`scripts/deploy.ps1`](../scripts/deploy.ps1) — same trigger, run manually from your machine

## What must exist ONLY on the server (never commit these)

- **`.env`** in `/home/ec2-user/mentora-web/` — the real production values:
  ```
  VITE_API_BASE_URL=https://api.mentoratr.com
  VITE_APP_ENV=production
  VITE_APP_NAME=Mentora
  VITE_SOCKET_URL=https://api.mentoratr.com
  VITE_SENTRY_DSN=
  ```
  `docker-compose.yml` reads this automatically and passes it into the image build as `--build-arg`s. It's already covered by `.gitignore` (`.env*`).
- **SSL certificates** — `/etc/letsencrypt/live/mentoratr.com/*` (managed by certbot, outside the repo entirely)
- **The EC2 SSH private key** (`.pem` file) — stays on your machine / in GitHub Actions secrets, never in the repo
- **Docker itself** — install Docker Engine + the compose plugin on the instance (one-time, see below)
- Running containers, images, and the `.git` clone under `/home/ec2-user/mentora-web` — server runtime state, not repo content

## What goes in GitHub repo Settings (not a committed file)

Settings → Secrets and variables → Actions:

- `EC2_HOST` — the instance's public IP or domain
- `EC2_SSH_KEY` — the private key contents (paste the `.pem` file contents)

The workflow YAML only _references_ `${{ secrets.EC2_HOST }}` / `${{ secrets.EC2_SSH_KEY }}` — the values themselves live in GitHub's encrypted secret store, not in any file.

## One-time server setup

SSH into the instance, then:

```bash
# Install Docker
sudo yum install -y docker   # Amazon Linux; use apt on Ubuntu
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user   # log out/in after this
docker compose version   # confirm the compose plugin is present

# Clone the repo (if not already there)
git clone https://github.com/<owner>/mentora-web.git /home/ec2-user/mentora-web
cd /home/ec2-user/mentora-web

# Create the server-only .env (see above) — this file never comes from git
nano .env

# First build + run
docker compose build
docker compose up -d
```

Then install the host Nginx config (reverse proxy + TLS) as usual:

```bash
sudo cp deploy/mentora-web.conf /etc/nginx/conf.d/mentora-web.conf
sudo nginx -t && sudo systemctl reload nginx
```

Certbot and the systemd auto-deploy timer, if already set up from the earlier
bare-metal deploy, keep working as-is — `deploy/auto-deploy.sh` now rebuilds
the Docker image instead of running `npm run build` directly, and the host
Nginx now proxies to the container instead of serving `dist/` itself.

## Every deploy, going forward

Nothing manual — push to `main` and either the GitHub Actions workflow or the
1-minute systemd timer (whichever runs first) pulls the commit, rebuilds the
image, and restarts the container. `npm run deploy` still works too, for a
manual trigger from your machine.
