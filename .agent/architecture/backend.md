# Backend Architecture and Conventions

Spring Boot 4.1 (Java 21), Spring Data JPA, Flyway, PostgreSQL, Spring Security with a JWT resource server, Lombok.
Facts below were verified in `server/`; update them when the code changes.

## Package layout

```text
server/src/main/java/e_learning/server/
├── activity/   controller · dto · entity · enums · repository · selection · service      (Phase 4)
├── auth/  user/  classes/  grades/
├── content/    unit · section · topic · questionBank · question · media · common
└── common/     config (SecurityConfig) · exception · response (ApiResponse) · dto (PageResponse)
```

A feature package owns its controller, DTOs, entities, repositories and services. Do not reach into another
feature's repository from a controller.

## Conventions

- **Entities:** Lombok `@Getter @Setter @Builder`, `IDENTITY` ids, `LocalDateTime` timestamps set in
  `@PrePersist` / `@PreUpdate`, enums stored as strings.
- **Services:** `@Transactional(readOnly = true)` on the class, `@Transactional` on writes. One transaction per
  aggregate operation (create, update, publish, archive); never partially save an aggregate.
- **DTOs:** requests are Lombok `@Data` classes with Bean Validation; responses are records or Lombok classes.
  Requests never carry owner ids, derived values (readiness, ready counts, quotas, `is_complete`) or runtime state.
- **Errors:** throw `AppException(ErrorCode)` or `AppException(ErrorCode, details)`; `GlobalExceptionHandler` turns it
  into `ApiResponse` with `data = details`. Add new codes to `ErrorCode` and to
  [`api-contract.md`](./api-contract.md). Bean-validation failures return `INVALID_REQUEST`.
- **Ownership:** the teacher id is `Long.valueOf(jwt.getSubject())`. Use owner-scoped repository methods
  (for example `findByIdAndTeacherId`); a missing resource and another teacher's resource both return 404.
- **Security:** role rules are path matchers in `SecurityConfig`. A new teacher-only API prefix must be added there.
- **Pagination:** `page` is 1-indexed; return `PageResponse`.
- **Filtering:** JPA `Specification` (`JpaSpecificationExecutor`), as in `QuestionService` and `ActivityService`.

## Database and migrations

- Flyway, `V{n}__snake_case_description.sql` in `src/main/resources/db/migration`. The latest is **V11**.
- `spring.jpa.hibernate.ddl-auto=validate`: every entity change needs a migration.
- **Never edit an applied migration.** Add the next version.
- Table prefixes: `content_*` for the content tree; `activities`, `activity_banks`, `activity_game_templates` for Activities.
- Enums are enforced with `CHECK` constraints; rules that span several columns are validated in the service layer.

## Tests

- JUnit 5 under `src/test/java`. Keep domain logic (for example distribution/quota calculation) free of Spring so it is
  unit-testable without a context.
- Run: `cd server && ./mvnw test`.
- Required by the Phase 4 spec but **not written yet**: readiness, validation, integration (all Activity endpoints) and
  security tests.

## Configuration

`application.properties` reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_BASE64_SECRET`, `CLOUD_NAME`, `API_KEY`,
`API_SECRET` and others from the environment. See [`PROGRESS.md`](../PROGRESS.md) "Known issues" about default values
committed in that file.
