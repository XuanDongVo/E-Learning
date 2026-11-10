import { StudentVocabularyHub } from "@/components/features/student/vocabulary/student-vocabulary-hub";

export default async function StudentVocabularyUnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ unitId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ unitId }, { mode }] = await Promise.all([params, searchParams]);
  return <StudentVocabularyHub unitId={Number(unitId)} initialTab={mode === "review" ? "review" : mode === "learn" ? "learn" : "browse"} />;
}
