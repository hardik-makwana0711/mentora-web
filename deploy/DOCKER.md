# Docker CI/CD — what lives where

mentora-web deploys the same way as infads: GitHub Actions builds the Docker
image and pushes it to GitHub Container Registry (GHCR); the EC2 instance
only ever pulls a pre-built image and restarts the container. Nothing is
built on the server, and no long-lived registry credential lives there —
the workflow's own short-lived token authenticates the pull and is
discarded immediately after.

## What's committed to GitHub (already done — nothing more to add)

- [`Dockerfile`](../Dockerfile) — multi-stage build: Node builds the app, Nginx serves it
- [`.dockerignore`](../.dockerignore) — keeps `node_modules`, `.env`, `.git` etc. out of the build context
- [`docker-compose.yml`](../docker-compose.yml) — pulls `ghcr.io/hardik-makwana0711/mentora-web:latest` and runs it on `127.0.0.1:8080`
- [`deploy/nginx.docker.conf`](nginx.docker.conf) — Nginx config **inside** the container (plain HTTP, SPA fallback)
- [`deploy/mentora-web.conf`](mentora-web.conf) — Nginx config **on the host**: terminates TLS for mentoratr.com and reverse-proxies to the container
- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — on push to `main`: builds the image, pushes it to GHCR, then SSHes into EC2 to pull + restart

## What must exist ONLY on the server (never commit these)

- **SSL certificates** — `/etc/letsencrypt/live/mentoratr.com/*` (managed by certbot, outside the repo entirely)
- **The EC2 SSH private key** (`.pem` file) — stays on your machine / in GitHub Actions secrets, never in the repo
- **Docker itself** — Docker Engine + the compose and buildx CLI plugins (one-time, see below)
- Running containers, images, and the pulled `ghcr.io/.../mentora-web` image — server runtime state, not repo content

There's no `.env` on the server anymore — the production `VITE_*` values are
baked into the image at CI build time (see the `build-args` in
`deploy.yml`), not read from a server-side file.

## What goes in GitHub repo Settings (not a committed file)

Settings → Secrets and variables → Actions:

- `EC2_HOST` — the instance's public IP or domain
- `EC2_SSH_KEY` — the private key contents (paste the `.pem` file contents)

`GITHUB_TOKEN` (used to push/pull from GHCR) is automatic — GitHub issues
one per workflow run with `packages: write`, no setup needed.

## One-time server setup

SSH into the instance, then:

```bash
# Docker Engine (Amazon Linux 2023's own repo doesn't ship the compose/buildx
# plugins, so those are installed straight from the upstream releases)
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user   # log out/in after this

sudo mkdir -p /usr/libexec/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose

# docker-compose.yml only pulls a pre-built image, so buildx isn't required
# on the server at all with this setup.

docker compose version   # confirm the compose plugin is present
```

Then, in `/home/ec2-user/mentora-web` (the existing git clone — the workflow
only needs `docker-compose.yml` there, it doesn't need to `git pull` first):

```bash
docker compose pull
docker compose up -d
```

Then install the host Nginx config (reverse proxy + TLS):

```bash
sudo cp deploy/mentora-web.conf /etc/nginx/conf.d/mentora-web.conf
sudo nginx -t && sudo systemctl reload nginx
```

## Every deploy, going forward

Push to `main` — GitHub Actions builds the image, pushes it to GHCR, then
pulls and restarts the container on EC2. That's the entire pipeline; there's
no polling timer and nothing else watching for changes.

## First-time GHCR note

The first push creates the `ghcr.io/hardik-makwana0711/mentora-web` package
automatically, scoped private to the repo. The deploy step doesn't need it
public — it logs in with the workflow's own token before pulling and logs
out right after, so no credential is left sitting on the server.
