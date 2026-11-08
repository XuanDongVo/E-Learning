# E-Learning — environment configuration (Phase 1)

This phase separates local development configuration from production **configuration only**. Dockerfiles, Compose and the reverse proxy are not included until phases 2–3.

## Backend: Spring Boot profiles

- `server/src/main/resources/application.properties` contains shared settings and requires `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_BASE64_SECRET`, `CORS_ALLOWED_ORIGINS`, `CLOUD_NAME`, `API_KEY` and `API_SECRET` from the environment.
- `application-dev.properties`: localhost database defaults, localhost CORS origins, DEBUG security logs, insecure cookie only when testing HTTP locally. Requires secrets supplied through environment variables.
- `application-prod.properties`: INFO security logs, HTTPS-only cookies by default, no built-in database credentials or localhost origins.
- Select a profile using `SPRING_PROFILES_ACTIVE=dev` or `SPRING_PROFILES_ACTIVE=prod`. The app will not silently fall back to a development profile.
- Access JWT expires after 3600 seconds and refresh after 604800 seconds unless overridden.
- Keep `spring.flyway.enabled=true` and `spring.jpa.hibernate.ddl-auto=validate` in every profile.

### Local development

1. Copy `.env.dev.example` to `.env.dev` in the repository root. Replace all `replace_with_...` values with **your own** non-production credentials. Create a local PostgreSQL database if necessary.
2. Generate a new JWT key (example: `openssl rand -base64 48`); don't reuse the key previously committed in `application.properties`.
3. Load `.env.dev` into the *process environment* used to launch Spring Boot (the Spring Boot app does **not** automatically read root `.env.dev` files).
   - Bash: `set -a; source .env.dev; set +a; cd server; ./mvnw spring-boot:run`
   - PowerShell (from repository root):

```powershell
Get-Content .env.dev | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object {
  $key, $value = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($key, $value, 'Process')
}
cd server
.\mvnw.cmd spring-boot:run
```

If you start Spring Boot from IntelliJ/another IDE, configure the run configuration's environment variables instead. Avoid putting secrets in tracked IDE configs.

## Frontend: local and production API routing

- Copy `client-e-learning/.env.local.example` to `client-e-learning/.env.local` and run `npm ci && npm run dev` from `client-e-learning`.
- In development, `NEXT_PUBLIC_API_URL` can point to `http://localhost:8080`; if unset, the app defaults to that local URL.
- In production, leave `NEXT_PUBLIC_API_URL` **unset or empty**. Requests use relative paths such as `/v1/grades`, so the browser stays on the frontend origin. Phase 3 will add a reverse proxy to route `/v1/*` to the backend.
- `NEXT_PUBLIC_*` values are compiled into the browser bundle by `next build`; rebuilding is required when they change. Do not use these variables for secrets.
- Before phase 3, running `next start` alone **will not** proxy `/v1/*`; use a separately configured public API URL for standalone tests or wait for Compose + proxy.

## Production / staging preparation

1. Copy `.env.prod.example` to `.env.prod` and replace all placeholders with independent production/staging values; do not commit that file.
2. Use a private DB and Cloudinary environment, and set `CORS_ALLOWED_ORIGINS` to the exact HTTPS frontend origin (never `*` with credentialed cookies).
3. HTTPS termination and proxy routing are required to use `JWT_COOKIE_SECURE=true` with browser cookies. For **HTTP-only localhost** production-mode tests, `JWT_COOKIE_SECURE=false` is a temporary testing exception, never a public deployment setting.
4. Rotate the previously committed JWT secret and Cloudinary API secret in their providers/consumers. Removing defaults from the current file does **not** remove old values from Git history.
5. Production deployments must address CSRF protection for cookie-authenticated write endpoints; CORS and SameSite=Lax are not a substitute for a CSRF defense.
6. No PostgreSQL data or Cloudinary media is migrated by this phase; database backups and migration tests come before deployment.

The root `.gitignore` ignores real `.env` variants throughout the repo and allows only `*.example` templates to be tracked.
