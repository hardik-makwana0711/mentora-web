# Deploying mentora-web to an EC2 instance (moving off Vercel)

This app is a static Vite build — no server-side code. The EC2 box only needs
Nginx to serve the built files; it does not need Node.js installed unless you
choose to build on the server itself.

## One-time server setup

SSH into the instance, then:

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo mkdir -p /var/www/mentora-web
sudo chown $USER:$USER /var/www/mentora-web
```

Copy `deploy/nginx.conf` from this repo, replace `YOUR_DOMAIN` with your real
domain, then install it:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/mentora-web
sudo ln -s /etc/nginx/sites-available/mentora-web /etc/nginx/sites-enabled/mentora-web
sudo rm -f /etc/nginx/sites-enabled/default   # avoid the default site catching your domain
sudo nginx -t && sudo systemctl reload nginx
```

Get an SSL certificate (requires the domain's DNS A record already pointing
at this instance's IP):

```bash
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

Certbot rewrites the Nginx config to add the HTTPS server block and redirect
HTTP → HTTPS automatically.

## Every deploy

Build locally (or in CI) with the **production** API URL baked in — Vite
inlines `VITE_*` env vars at build time, so `.env` must be correct _before_
running `build`:

```bash
npm ci
npm run build
```

Copy the build output to the server:

```bash
rsync -avz --delete dist/ your-user@YOUR_SERVER_IP:/var/www/mentora-web/dist/
```

That's it — Nginx serves the new files immediately (index.html is set to
never cache, so users get the new build on their next request without
needing a hard refresh).

## Why the Nginx config matters

This app uses `createBrowserRouter` (React Router's History API mode), so a
direct visit or refresh on any route other than `/` — e.g.
`/parent/dashboard` — is a request straight to Nginx for that exact path.
Without the `try_files $uri $uri/ /index.html;` fallback in `deploy/nginx.conf`,
every such request 404s. Vercel does this automatically for detected
frameworks with zero config, which is why the app worked there without any
routing config committed to the repo — moving off Vercel means this now has
to be explicit.
