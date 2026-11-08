# Deployment

## Local development in IntelliJ

1. Copy `.env.dev.example` to `.env.dev` and set the required values.
2. Start the Spring Boot application directly from IntelliJ. The `.env.dev` import
   supports both the repository root and `server/` as the working directory.

`application.properties` defaults to the `dev` profile and
`application-dev.properties` imports `.env.dev` as a properties file. IntelliJ
therefore starts the backend without manually copying environment variables. Any
environment variable supplied by an IntelliJ run configuration still overrides the
file value.

## Production Compose

1. Copy `.env.prod.example` to `.env.prod`; set every placeholder with a unique
   production value. Keep this file outside source control.
2. Run:

```bash
docker compose --env-file .env.prod up -d --build
```

The browser reaches Nginx on port 80. Nginx proxies `/v1/` to Spring Boot and all
other paths to Next.js, so the browser uses same-origin API calls.

Terminate TLS in an upstream load balancer or replace the Nginx configuration with
one that serves a certificate before exposing this stack publicly. Production must
use an HTTPS origin in `CORS_ALLOWED_ORIGINS` and `JWT_COOKIE_SECURE=true`.

## Development Compose seed

`compose-dev.yaml` starts its one-shot `seed` service automatically only after the
backend health check succeeds, which means Flyway has completed. Add
`SEED_CONFIRM=DISPOSABLE_TEST_DB` to the ignored `.env.dev` to explicitly permit
the destructive development seed. Then one command starts the full local stack:

```bash
docker compose --env-file .env.dev -f compose-dev.yaml up -d --build
```

The development frontend uses a Next.js same-origin `/v1/*` rewrite to the
internal `backend:8080` service. You may therefore use either
`http://localhost:3000/vi` or `http://127.0.0.1:3000/vi`; do not configure an
absolute `NEXT_PUBLIC_API_URL` for this Compose stack.
