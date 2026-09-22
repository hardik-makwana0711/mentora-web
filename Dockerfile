# Multi-stage build for mentora-web (Vite + React SPA).
#
# Stage 1 builds the static bundle with the production API URL baked in
# (Vite inlines VITE_* vars at build time, so they must be set before `vite build`
# runs, not at container start). Stage 2 serves the result with Nginx.
#
# Build with the real values, e.g.:
#   docker build \
#     --build-arg VITE_API_BASE_URL=https://api.mentoratr.com \
#     --build-arg VITE_SOCKET_URL=https://api.mentoratr.com \
#     -t mentora-web .
# In practice, use `docker compose build` instead — it reads these from
# the server's local .env file (see deploy/DOCKER.md).

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_APP_ENV=production
ARG VITE_APP_NAME=Mentora
ARG VITE_SOCKET_URL
ARG VITE_SENTRY_DSN=

RUN printf 'VITE_API_BASE_URL=%s\nVITE_APP_ENV=%s\nVITE_APP_NAME=%s\nVITE_SOCKET_URL=%s\nVITE_SENTRY_DSN=%s\n' \
      "$VITE_API_BASE_URL" "$VITE_APP_ENV" "$VITE_APP_NAME" "$VITE_SOCKET_URL" "$VITE_SENTRY_DSN" > .env.production

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx.docker.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
