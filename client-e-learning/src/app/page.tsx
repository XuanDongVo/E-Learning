import LearningStorybookLanding from "@/components/landing/LearningStorybookLanding";
import { AuthProvider } from "@/components/auth/auth-provider";
import { QueryProvider } from "@/lib/query-provider";

export default function HomePage() {
  return (
    <QueryProvider>
      <AuthProvider>
        <LearningStorybookLanding />
      </AuthProvider>
    </QueryProvider>
  );
}

