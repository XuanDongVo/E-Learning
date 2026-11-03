import { StudentHubLayout } from "@/components/features/teacher/students/student-hub-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StudentHubLayout>{children}</StudentHubLayout>;
}
