
<div align="center">

# LearnUp

### A Full-stack English Learning Platform

A web-based learning platform designed to support
English education through structured learning content,
interactive activities, assignments, vocabulary review,
and gamification.

**Built with Java, Spring Boot, Next.js, and PostgreSQL.**

[Live Demo](https://frontend-production-c5c3.up.railway.app/)


![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

</div>

---

## Overview

LearnUp is a full-stack English learning application
built around two primary roles: **Teachers** and
**Students**.

Teachers can organize learning materials, manage
classes and assignments, and review student results.

Students can explore learning units, practice through
interactive activities, complete assignments, review
vocabulary, and track their learning progress.

The project focuses on both user experience and
backend engineering, including role-based security,
business workflows, data integrity, transactional
reward processing, and learning progress management.

> **Project status:** Personal development project.
> The publicly accessible deployment is intended
> for demonstration and testing, not commercial
> production use.

---

## Features

### 1. Authentication & Authorization

- JWT-based authentication using Spring Security.
- Role-based access control for teachers and students.
- Protected REST API endpoints.
- Access-token and refresh-token workflows.
- Account status validation and authorization checks.

### 2. Learning Content Management

Teachers can manage structured English learning
content through:

- Grades and learning units.
- Sections and topics.
- Question banks and questions.
- Vocabulary learning materials.
- Media resources.
- Question-bank CSV import.

The content structure allows learning materials
to be reused across practice activities and
assignments.

### 3. Interactive Learning Activities

Students can practice English through
activity-based learning workflows.

Core functionality includes:

- Question selection from available question pools.
- Randomized practice sessions.
- Different activity modes and configurations.
- Server-managed session lifecycle.
- Answer validation and result processing.
- Time limits and session completion handling.

The backend manages session state and question
selection to support consistent activity behavior.

### 4. Assignment Management

The assignment module supports teacher-managed
assessment workflows.

**For Teachers**
- Create and manage assignments.
- Organize assignment questions.
- Manage assignment composition.
- Review submissions and assessment results.
- Access assignment analysis functionality.

**For Students**
- View available assignments.
- Start assessment attempts.
- Submit answers.
- Receive evaluated results.

Assignment processing is handled by dedicated
backend services for attempt management,
answer processing, and grading.

### 5. Vocabulary Learning & Review

LearnUp includes vocabulary management and
review functionality.

- Vocabulary organization by learning content.
- Student vocabulary review workflows.
- Individual vocabulary progress tracking.
- Review history recording.
- FSRS-based spaced-repetition scheduling.

The review system calculates future review
schedules based on student responses and
stored vocabulary progress.

### 6. Gamification

The platform includes a gamification system
designed to encourage consistent learning.

**Experience Points (XP)**
- XP calculation for eligible activity sessions.
- Question-based rewards and completion bonuses.
- Transactional reward settlement.
- Idempotency protection against duplicate rewards.

**Learning Streaks**
- Daily learning qualification through completed
  activities.
- Current and longest streak tracking.
- Streak milestones and XP rewards.

**Levels & Leaderboards**
- Level progression based on accumulated XP.
- XP-based rankings.
- Streak-based rankings.
- Time-based filters for XP leaderboards.

Gamification state and rewards are managed
by the backend.

### 7. Student & Teacher Experience

**Student workspace**
- Learning units and activities.
- Assignment workflows.
- Vocabulary practice and review.
- Learning progress.
- XP, levels, streaks, and leaderboards.
- Student profile.

**Teacher workspace**
- Learning content management.
- Class and student management.
- Assignment creation and management.
- Question bank management.
- Assessment analysis.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Client State | TanStack Query, Zustand |
| Backend | Java 21, Spring Boot |
| Security | Spring Security, JWT |
| Persistence | Spring Data JPA |
| Database | PostgreSQL |
| Migrations | Flyway |
| Vocabulary Review | FSRS |
| Media | Cloudinary |
| Infrastructure | Docker, Docker Compose, Nginx |
| Demo Hosting | Railway |

---

## System Architecture

LearnUp uses a frontend-backend architecture
with a relational database.

```text
              Web Browser
                   |
                   v
          Next.js Frontend
          React + TypeScript
                   |
                REST API
                   |
                   v
          Spring Boot Backend
          Java + Spring Security
                   |
          +--------+--------+
          |                 |
          v                 v
      PostgreSQL        Cloudinary
      Database          Media Storage
```

### Backend Architecture

The backend separates responsibilities across
controllers, services, repositories, entities,
and data-transfer objects.

Key modules include:

```text
server/
└── src/main/java/e_learning/server/
    ├── auth/
    ├── activity/
    ├── activitysession/
    ├── assessmentattempt/
    ├── assignment/
    ├── assignmentanalysis/
    ├── classes/
    ├── content/
    ├── gamification/
    ├── grades/
    ├── student/
    ├── user/
    └── vocabulary/
```

Business rules and validation are handled
in application services, with Spring Data JPA
responsible for persistence.

### Frontend Architecture

The Next.js application contains
role-specific pages, reusable UI components,
API services, and shared application state.

The frontend uses TanStack Query for
server-state management and provides
separate interfaces for teachers and students.

---

## Project Structure

```text
E-Learning/
├── client-e-learning/      # Next.js frontend
├── server/                 # Spring Boot backend
├── deploy/                 # Deployment configuration
│   └── nginx/
├── docker/                 # Docker utilities
├── docs/                   # Technical documentation
├── compose-dev.yaml        # Development stack
├── compose-production.yaml # Deployment stack
├── .env.dev.example        # Development env template
└── .env.prod.example       # Production env template
```

---

## Getting Started

### Prerequisites

Before running the project, install:

- Java 21
- Node.js and npm compatible with Next.js 16
- PostgreSQL
- Docker and Docker Compose (recommended)
- Git

Cloudinary credentials are required for
features that use cloud media storage.

### 1. Clone the Repository

```bash
git clone https://github.com/XuanDongVo/E-Learning.git
cd E-Learning
```

### 2. Configure Environment Variables

Copy the development template:

```bash
cp .env.dev.example .env.dev
```

Update the required values in `.env.dev`.

Important variables include:

| Variable | Description |
|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_BASE64_SECRET` | Base64-encoded JWT signing secret |
| `JWT_ACCESS_TOKEN_EXPIRE` | Access token expiration |
| `JWT_REFRESH_TOKEN_EXPIRE` | Refresh token expiration |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins |
| `CLOUD_NAME` | Cloudinary cloud name |
| `API_KEY` | Cloudinary API key |
| `API_SECRET` | Cloudinary API secret |

For Docker Compose, also provide:

```env
POSTGRES_DB=e_learning
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_local_password
```

Use a unique signing secret and appropriate
database credentials.

**Never commit real `.env` files, passwords,
API keys, or JWT signing secrets.**

### 3. Start with Docker Compose

The recommended development setup runs the
frontend, backend, and PostgreSQL database
as containers.

First, review the seed configuration.

The development Compose stack contains a
seed service that may populate or reset
development data.

**Use a disposable database only when
enabling the seed service.**

Configure `.env.dev` and run:

```bash
docker compose \
  --env-file .env.dev \
  -f compose-dev.yaml \
  up -d --build
```

Access the application at:

```text
http://localhost:3000/vi
```

Backend:

```text
http://localhost:8080
```

The frontend uses a same-origin `/v1/*`
rewrite to access the backend within
the Docker network.

To stop the containers:

```bash
docker compose \
  --env-file .env.dev \
  -f compose-dev.yaml \
  down
```

Do not add `-v` unless you intentionally
want to remove persisted Docker volumes.

### 4. Manual Development Setup

Alternatively, run the frontend and backend
separately.

**Backend**

Configure `.env.dev`, prepare PostgreSQL,
and start the Spring Boot application
from IntelliJ IDEA or Maven.

```bash
cd server
./mvnw spring-boot:run
```

On Windows:

```powershell
cd server
.\mvnw.cmd spring-boot:run
```

**Frontend**

In another terminal:

```bash
cd client-e-learning
npm install
npm run dev
```

The frontend is available at:

```text
http://localhost:3000
```

For manual development, configure frontend
API routing according to your environment.
The Docker setup provides this routing
automatically.

---

## Database & Migrations

LearnUp uses PostgreSQL for relational
data persistence and Flyway for database
schema migrations.

Flyway migrations are managed by
the Spring Boot backend.

The application data model supports:

- Users, roles, and student profiles.
- Classes and class membership.
- Grades, units, sections, and topics.
- Questions and question banks.
- Learning activities and sessions.
- Assignments and assessment attempts.
- Vocabulary progress and review logs.
- XP transactions and gamification profiles.

Development seed data is separate from
normal application startup.

Do not run disposable development seeds
against real user data.

---

## Security Considerations

The backend uses Spring Security to
protect application resources.

Security-related functionality includes:

- JWT authentication.
- Role-based endpoint authorization.
- Access and refresh token handling.
- Account status validation.
- Protected teacher and student resources.

Production-style deployments should use:

- HTTPS.
- Secure cookie settings.
- Strong, unique JWT signing secrets.
- Restricted CORS origins.
- Protected database credentials.
- Environment-specific configuration.

The demo environment should not be
treated as a production security guarantee.

---

## Deployment

A public demonstration is available at:

**[LearnUp Live Demo](https://frontend-production-c5c3.up.railway.app/)**

The demonstration environment uses Railway
for frontend, backend, and database hosting.

The repository also contains Docker Compose
and Nginx configuration for self-hosted
deployment.

For the documented Compose deployment:

```bash
cp .env.prod.example .env.prod
```

Configure the deployment environment,
then run:

```bash
docker compose \
  --env-file .env.prod \
  -f compose-production.yaml \
  up -d --build
```

The Nginx reverse proxy routes:

```text
/       -> Next.js frontend
/v1/*   -> Spring Boot backend
```

Configure HTTPS termination before
exposing the stack publicly.

For additional deployment instructions,
see [Deployment Guide](deploy/README.md).

---

## Development Status

LearnUp is an independently developed
personal software engineering project.

Its purpose is to explore and demonstrate:

- Full-stack application development.
- Backend business logic and API design.
- Authentication and authorization.
- Relational database design.
- Transaction consistency.
- Learning workflow management.
- Gamification systems.
- Deployment and infrastructure configuration.

The live environment is available for
demonstration and testing.

It is not presented as a commercial
production application.

---

## Author

**Vo Xuan Dong**

Full-stack Developer | Java Backend

- GitHub: [XuanDongVo](https://github.com/XuanDongVo)
- LinkedIn: [Vo Xuan Dong](https://www.linkedin.com/in/dong-vo-xuan-667b10439/)
- Email: [voxuandong14052004@gmail.com](mailto:voxuandong14052004@gmail.com)

---

<div align="center">

**LearnUp — Learn. Practice. Progress.**

Built with Java, Spring Boot, Next.js, and PostgreSQL.

</div>
