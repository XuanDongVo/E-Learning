# Project Overview and Tech Stack

<!-- Moved from the former client-e-learning/AGENTS.md. Edit here. -->

## Project Overview

This project is a Next.js web application for an internal English learning platform for teachers and students (Grades 6–8).

The product combines:

- Unit-based English learning content
- Reusable question banks
- Practice activities
- Game-based activities
- Teacher assignments
- Student attempts and results
- Learning analytics
- XP and grade-level ranking
- User authentication

The project must prioritize:

- Maintainability
- Correctness 
- Consistency
- Clear separation of concerns
- Reusable domain concepts
- End-to-end feature completeness
- Alignment between database/domain, backend API, frontend UI, and business rules

The frontend must not invent domain concepts that do not exist in the agreed architecture.
The UI, API, and database/domain model must describe the same system.

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- REST API
- Backend: Spring Boot (Java 21) REST API in `server/`, deployed separately from the Next.js frontend
- PostgreSQL is the application database

Use the existing libraries and patterns already present in the project.

Do not introduce a new library unless it is necessary and there is no suitable existing solution.

---
