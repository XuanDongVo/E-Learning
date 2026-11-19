import { notFound } from "next/navigation";
import { StudentFoundationsLab } from "@/components/student-ui/student-foundations-lab";

/** Internal Student preview; no production route or navbar entry. */
export default function StudentDesignLabPage() {
  // if (process.env.NODE_ENV !== "development") notFound();
  return <StudentFoundationsLab />;
}
