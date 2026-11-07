/*
 * Legacy demo route: reuse the authenticated student's real profile.
 * Never render mock personally identifying or guardian information here.
 */
import StudentProfilePage from "@/components/features/student/profile/student-profile-page";

export default function Page() {
  return <StudentProfilePage />;
}
