import { StudentVocabularyHub } from "@/components/features/student/vocabulary/student-vocabulary-hub";

export default async function StudentUnitVocabularyPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  return <StudentVocabularyHub unitId={Number(unitId)} />;
}
