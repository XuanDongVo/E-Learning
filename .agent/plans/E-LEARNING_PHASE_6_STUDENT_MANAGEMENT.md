# Phase 6 — Student Management

## Scope
6.1 Audit User + existing ClassMember
6.2 StudentProfile entity + migration
6.3 StudentGuardian entity + migration
6.4 Student Profile API
6.5 Student Management API
6.6 ClassMember API
6.7 Teacher Student Screens
6.8 Student Profile Screen
6.9 Integration/unit tests

## Domain decisions
- User remains the authentication/account entity and owns email, fullName, role, and account status.
- StudentProfile stores student-specific personal data.
- StudentGuardian stores one or more guardian contacts.
- ClassMember remains the source of class membership and membership status.
- TeacherProfile and a separate Student entity are intentionally not introduced.
- Student account status and class membership status remain separate.
- Removing a student from a class sets membership INACTIVE; it does not delete the User.
- Creating a student is transactional across User + StudentProfile + StudentGuardian + ClassMember.

## Frontend structure
Student screens are split into route pages, feature components, services, and src/types/student.ts. Pages do not contain the complete UI implementation.

## Test coverage
Backend tests cover student creation, duplicate email, duplicate membership, membership removal, non-student profile access, profile retrieval, and teacher student API reads. Frontend tests cover search/status filtering.
