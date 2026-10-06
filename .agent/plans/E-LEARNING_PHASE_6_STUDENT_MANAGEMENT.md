# Phase 6 — Student Management

## Scope
6.1 Audit User + existing ClassMember
6.2 StudentProfile Entity + Migration
6.3 StudentGuardian Entity + Migration
6.4 Student Profile API
6.5 Student Management API
6.6 ClassMember API
6.7 Teacher Student Screens
6.8 Student Profile Screen
6.9 Integration/unit tests
6.10 Class lifecycle + advanced student list

## Domain decisions
- User remains the authentication/account entity and owns email, fullName, role, and account status.
- StudentProfile stores student-specific personal data.
- StudentGuardian stores one or more guardian contacts.
- ClassMember remains the source of class membership and membership status.
- TeacherProfile and a separate Student entity are intentionally not introduced.
- Student account status and class membership status remain separate.
- Removing a student from a class sets membership INACTIVE; it does not delete the User.
- Creating a student is transactional across User + StudentProfile + StudentGuardian + ClassMember.
- Class has ACTIVE/ARCHIVED lifecycle.
- Archived classes stay visible but cannot accept new memberships.
- Locking a student changes User.status to INACTIVE and keeps class memberships.

## Teacher Students UI
- Follow the supplied reference layout, but keep it compact.
- One student card per student.
- Checkbox + avatar + name + email + phone.
- Account status at top-right.
- Classes and primary guardian below a divider.
- Active classes use compact chips.
- No active class shows a single `No active class` state.
- Inactive memberships show short history such as `Removed from 6A`.
- View/Edit actions stay aligned on the right.
- Advanced filters: class, grade, account status, and no active class.
- Multi-select is available for future bulk actions.

## Class management
- Class cards support Edit and Archive.
- Edit reuses the existing class dialog.
- Archive is a soft lifecycle change and preserves membership/history.

## Test matrix
### Student profile
- GET profile for authenticated student.
- PUT personal fields.
- Create/update guardian.
- Reject more than one primary guardian.
- Reject teacher/non-student access.

### Student management
- List students connected to teacher-owned classes.
- Student with multiple classes appears once with multiple class entries.
- Student with only inactive memberships appears with no active class plus history.
- Student outside teacher-owned memberships cannot be retrieved or locked.
- Duplicate email rejected.
- Create persists User + StudentProfile + guardians + ClassMember transactionally.
- Teacher can lock and unlock student account.

### Class membership
- Add active student.
- Reject duplicate active membership.
- Reactivate inactive membership.
- Remove marks membership INACTIVE without deleting account.
- Archived class rejects new/reactivated membership.

### Class lifecycle
- Teacher can edit own class.
- Teacher cannot edit another teacher class.
- Teacher can archive own class.
- Archived class remains visible as ARCHIVED.

### Frontend
- Search name/email/phone.
- Class filter.
- Grade filter.
- Account status filter.
- No-active-class filter.
- Select all/select individual.
- Student status PATCH.
- Class edit PUT.
- Class archive PATCH.

## Verification
Core frontend filter/service tests and student account status unit tests were added. The GitHub connector cannot execute Maven/Node commands in this environment, so runtime PASS is not claimed.
