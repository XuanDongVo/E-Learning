import { StudentIllustration } from "./student-illustration";
import type { StudentVisualId } from "@/lib/student-visuals/registry";

type DoodleId = Extract<StudentVisualId, `doodle.${string}`>;

/** Decorative only. Never use doodles to convey graded or essential information. */
export function StudentDoodle({ id, className }: { id: DoodleId; className?: string }) {
  return <StudentIllustration id={id} decorative className={className} />;
}
