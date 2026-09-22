# Deploying mentora-web

CI/CD with Docker, same pattern as infads: GitHub Actions builds the image
and pushes it to GHCR on every push to `main`, then SSHes into the EC2
instance to pull and restart the container. The host's own Nginx terminates
TLS for `mentoratr.com` and reverse-proxies to the container.

See [`deploy/DOCKER.md`](DOCKER.md) for the full breakdown of what's
committed to GitHub versus what must exist only on the server, plus
one-time server setup steps.

## Every deploy

Nothing to run locally or on the server — push to `main` and
[the workflow](../.github/workflows/deploy.yml) builds, pushes, and deploys
automatically, usually within a minute or two.

## Why the Nginx config matters

This app uses `createBrowserRouter` (React Router's History API mode), so a
direct visit or refresh on any route other than `/` — e.g.
`/parent/dashboard` — is a request straight to Nginx for that exact path.
Without the `try_files $uri $uri/ /index.html;` fallback
(in [`deploy/nginx.docker.conf`](nginx.docker.conf), inside the container),
every such request 404s. Vercel did this automatically, which is why the app
worked there with zero routing config — that now has to be explicit.
