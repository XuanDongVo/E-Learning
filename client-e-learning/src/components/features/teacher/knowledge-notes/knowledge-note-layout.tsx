// import type { ReactNode } from "react";
// import { Link } from "@/i18n/navigation";

// export function TeacherKnowledgeNoteLayout({
//   title, description, children,
// }: { title: string; description: string; children: ReactNode }) {
//   return (
//     <main className="space-y-5">
//       <nav
//         aria-label="Breadcrumb"
//         className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground"
//       >
//         <Link
//           href="/teacher"
//           className="transition-colors hover:text-foreground hover:underline"
//         >
//           Tổng quan
//         </Link>
//         <span aria-hidden="true" className="text-border">/</span>
//         <Link
//           href="/teacher/knowledge-notes"
//           className="transition-colors hover:text-foreground hover:underline"
//         >
//           Knowledge Notes
//         </Link>
//       </nav>
//       <header className="rounded-lg border border-border bg-card px-5 py-4 shadow-sm sm:px-6 sm:py-5">
//         <h1 className="break-words text-lg font-extrabold tracking-tight text-foreground">
//           {title}
//         </h1>
//         <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
//           {description}
//         </p>
//       </header>
//       {children}
//     </main>
//   );
// }

// export function KnowledgeNoteFeaturePending({ phase }: { phase: string }) {
//   return (
//     <div
//       role="status"
//       className="rounded-lg border border-dashed border-border bg-card p-5 text-sm shadow-sm sm:p-6"
//     >
//       <p className="font-bold text-foreground">
//         Khung tính năng đã được tạo — chưa triển khai nghiệp vụ
//       </p>
//       <p className="mt-2 leading-6 text-muted-foreground">
//         {phase}. Chưa có dữ liệu giả, chức năng lưu/công bố chưa được bật.
//       </p>
//     </div>
//   );
// }