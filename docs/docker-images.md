# Docker image builds — Phase 2

This phase adds **two independent production images**, not Docker Compose or a reverse proxy. Run all build commands from the **repository root** with Docker Desktop running (Linux containers).

## 1. Build images

```powershell
docker build -t elearning-backend:local ./server
docker build -t elearning-frontend:local ./client-e-learning
```

The frontend is built with an empty `NEXT_PUBLIC_API_URL`, so its browser API calls use the same origin (`/v1/*`). **Without the phase-3 proxy**, this frontend image can render pages, but its API calls will not reach the backend.

For a temporary two-port localhost smoke test **before phase 3**, build a frontend that explicitly calls your localhost backend:

```powershell
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:8080 -t elearning-frontend:local ./client-e-learning
```

Important: the browser uses the public URL compiled at **image build time**; `localhost` above is interpreted by the **user's browser**. Do not use `http://backend:8080` as a browser API URL. Never put credentials in `NEXT_PUBLIC_*` values or build args.

## 2. Start backend against a running PostgreSQL on your Windows host

Copy `.env.dev.example` to `.env.dev` (not committed), configure real **development/test-only** secrets, and ensure the target database already exists. Docker does not automatically load `.env.dev` from the repository.

On Docker Desktop for Windows, the backend container must use `host.docker.internal`, not `localhost`, to connect to a database running on Windows:

```powershell
docker run --rm --name elearning-backend -p 8080:8080 `
  --env-file .env.dev `
  -e DB_URL=jdbc:postgresql://host.docker.internal:5432/e_learning `
  elearning-backend:local
```

The `dev` profile in the .env file permits insecure cookies only for **HTTP localhost testing**. Running `prod` with HTTP-only localhost instead requires a separate test env with `JWT_COOKIE_SECURE=false`. Never use that override when serving a public HTTP domain. PostgreSQL must accept connections from Docker's host gateway.

## 3. Start frontend independently

With the **localhost-API build** from section 1 and the backend listening at localhost:8080:

```powershell
docker run --rm --name elearning-frontend -p 3000:3000 elearning-frontend:local
```

Open `http://localhost:3000/vi` in your browser. This is a temporary local smoke test, **not** a secure production deployment. The backend must allow `http://localhost:3000` in `CORS_ALLOWED_ORIGINS`.

## 4. Verify basic runtime behavior

```powershell
docker images elearning-backend elearning-frontend
docker ps
docker logs elearning-backend
docker logs elearning-frontend
```

Check the frontend renders, the backend connects to PostgreSQL and Flyway migrations complete, then manually test login, cookie refresh and at least one authenticated API call.

## Security and boundaries

- Runtime secrets are supplied through `--env-file`/environment at **container start**, never copied into images. Do not commit `.env.dev` or `.env.prod`.
- Docker images run as non-root users and use production build artifacts (Next.js standalone + Spring Boot JAR). Dockerfile Java 21 / Node 22 match the application's requirements.
- The production-safe frontend default expects the phase-3 reverse proxy to forward `/v1/*` to the backend. This phase intentionally does **not** provision PostgreSQL, TLS, proxy, service discovery, healthchecks, Compose, or backups.
- Run the normal unit/integration test suites in CI or before deployment; the backend Docker build skips test execution to make image creation independent of external database test fixtures.
- Credentials previously committed to Git history must be rotated before an Internet-facing deployment.

Development in IntelliJ (`dev` profile) and `npm run dev` remains unchanged. See [environment setup](environment-setup.md).
