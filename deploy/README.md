# Deploying mentora-web

The app runs as a Docker container on an EC2 instance: Nginx inside the
container serves the Vite build, and the host's own Nginx terminates TLS for
`mentoratr.com` and reverse-proxies to the container.

See [`deploy/DOCKER.md`](DOCKER.md) for the full breakdown of what's
committed to GitHub versus what must exist only on the server, plus one-time
server setup steps.

## Every deploy

Nothing to run locally — push to `main` and either:

- the [GitHub Actions workflow](../.github/workflows/deploy.yml) SSHes into
  the server and rebuilds immediately, or
- the server's own systemd timer (`deploy/auto-deploy.sh`, polling every
  minute) picks up the new commit

Both do the same thing: `git pull`, `docker compose build`, `docker compose
up -d`. `npm run deploy` runs the same trigger manually from your machine if
you don't want to wait.

## Why the Nginx config matters

This app uses `createBrowserRouter` (React Router's History API mode), so a
direct visit or refresh on any route other than `/` — e.g.
`/parent/dashboard` — is a request straight to Nginx for that exact path.
Without the `try_files $uri $uri/ /index.html;` fallback
(in [`deploy/nginx.docker.conf`](nginx.docker.conf), inside the container),
every such request 404s. Vercel did this automatically, which is why the app
worked there with zero routing config — that now has to be explicit.
