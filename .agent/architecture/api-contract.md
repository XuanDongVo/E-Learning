# API Contract

Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`). All paths are under `/v1`.

## Authentication and roles
- JWT authentication; authenticated user id is JWT `sub`.
- `TEACHER` owns `/v1/users/students` and `/v1/classes/**`.
- Student-management ownership is derived from the authenticated teacher.

## ClassController
| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/classes` | List teacher classes |
| POST | `/v1/classes` | Create class |
| PUT | `/v1/classes/{classId}` | Edit class |
| PATCH | `/v1/classes/{classId}/archive` | Archive class |

Archived classes remain visible but cannot receive new/reactivated memberships.

## Student profile
| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/student/profile` | Current student profile |
| PUT | `/v1/student/profile` | Update current student profile |

## Teacher student management
| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/users/students` | List teacher-owned students, including students with no active class |
| GET | `/v1/users/students/{studentId}` | Student detail scoped to teacher-owned membership |
| POST | `/v1/users/students` | Create student account/profile/guardian/membership transaction |
| PATCH | `/v1/users/students/{studentId}/status` | Lock/unlock student account |

The list contains all memberships belonging to the teacher so multiple classes and removed memberships can be displayed without duplicating student rows.

## Class membership
| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/classes/{classId}/members` | List class students |
| POST | `/v1/classes/{classId}/members` | Add/reactivate membership |
| DELETE | `/v1/classes/{classId}/members/{studentId}` | Mark membership INACTIVE |

Student account status and class membership status remain separate.

## Student list UI
- Search by name, email, or phone.
- Filter by class, grade, and account status.
- Quick filter for no active class.
- Multi-select rows for future bulk actions.
- Compact student cards: identity, status, classes, primary guardian, View and Edit.
- Multiple classes appear in one student row.
- Inactive memberships appear as short history text such as `Removed from 6A`.
