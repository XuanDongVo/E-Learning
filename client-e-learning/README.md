Structure project 

src/
├── app/
│   ├── layout.tsx                    # Root layout (Plus Jakarta Sans font, QueryClientProvider, MockAuthProvider)
│   ├── globals.css                   # Vibrant Scholastic design tokens, Tailwind base
│   │
│   ├── (student)/                    # KHÔNG GIAN HỌC SINH (Student Layout)
│   │   ├── layout.tsx                # Shell layout: Sidebar (Desktop) + Bottom Nav (Mobile)
│   │   ├── page.tsx                  # 1. Home / Dashboard
│   │   ├── units/
│   │   │   ├── page.tsx              # 2. Units Grid
│   │   │   └── [unitId]/page.tsx     # 3. Unit Detail (Topics & Related Assignment)
│   │   ├── practice/
│   │   │   ├── page.tsx              # 4. Practice Mode & Skill Selection
│   │   │   └── [sessionId]/page.tsx  # Practice Session Runner
│   │   ├── assignments/
│   │   │   ├── page.tsx              # 5. Assignments Overview
│   │   │   └── [id]/page.tsx         # 6. Assignment Details ("Before you start")
│   │   ├── progress/
│   │   │   └── page.tsx              # 8. Learning Progress & Analytics
│   │   └── profile/
│   │       └── page.tsx              # 9. User Profile
│   │
│   ├── (teacher)/                    # KHÔNG GIAN GIÁO VIÊN (Teacher Layout)
│   │   ├── layout.tsx                # Teacher Dashboard Layout (Sidebar quản lý)
│   │   ├── page.tsx                  # Teacher Dashboard (Tổng quan lớp, bài nộp cần chấm)
│   │   ├── assignments/
│   │   │   ├── page.tsx              # Quản lý danh sách bài tập đã giao
│   │   │   └── create/page.tsx       # Tạo bài tập / câu hỏi mới
│   │   └── students/
│   │       └── page.tsx              # Danh sách học sinh & bảng điểm
│   │
│   └── (exam)/                       # KHÔNG GIAN PHÒNG THI (Fullscreen Lockdown)
│       └── assignments/[id]/take/
│           ├── layout.tsx            # Standalone Fullscreen layout (No navbars)
│           └── page.tsx              # 7. Assignment In-Progress Runner & Result View
│
├── components/
│   ├── ui/                           # shadcn/ui components (Button, Card, Badge, Progress, Tabs, Input, Dialog, etc.)
│   ├── layout/
│   │   ├── student-sidebar.tsx       # Desktop Sidebar cho Student
│   │   ├── student-bottom-nav.tsx    # Mobile Bottom Navigation cho Student
│   │   ├── student-header.tsx        # Mobile Top Header
│   │   ├── teacher-sidebar.tsx       # Sidebar cho Teacher
│   │   └── role-switcher.tsx         # Floating switcher để test chuyển đổi Student <-> Teacher
│   ├── shared/
│   │   ├── stat-card.tsx             # Thẻ hiển thị Streak, XP, Rank
│   │   ├── mascot-banner.tsx         # Banner mascot khích lệ
│   │   └── progress-bar.tsx          # Thanh tiến trình học tập
│   └── features/
│       ├── student/                  # Components dành riêng cho Student
│       │   ├── dashboard/
│       │   ├── units/
│       │   ├── practice/
│       │   └── assignments/
│       │       ├── quiz-card.tsx
│       │       ├── quiz-palette.tsx  # Ma trận câu hỏi 1..20
│       │       ├── quiz-timer.tsx
│       │       └── quiz-result.tsx
│       └── teacher/                  # Components dành riêng cho Teacher
│
├── mock/
│   └── db.ts                         # CSDL MOCK TẬP TRUNG (Users, Units, Assignments, Questions, Leaderboard)
│
├── services/                         # API Layer (Mock fetchers + TanStack Query hooks)
│   ├── auth.service.ts
│   ├── units.service.ts
│   ├── assignments.service.ts
│   ├── practice.service.ts
│   └── leaderboard.service.ts
│
├── types/                            # TypeScript Data Models
│   ├── user.ts
│   ├── unit.ts
│   ├── assignment.ts
│   └── practice.ts
│
└── lib/
    ├── utils.ts                      # `cn` helper
    └── query-client.ts               # React Query config
