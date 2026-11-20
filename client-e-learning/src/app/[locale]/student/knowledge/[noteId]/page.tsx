import { notFound } from "next/navigation";
import { StudentKnowledgeNoteDetail } from "@/components/features/student/knowledge/student-knowledge-note-detail";

export default async function KnowledgeNoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const parsedId = Number(noteId);
  if (!Number.isSafeInteger(parsedId) || parsedId <= 0) notFound();
  return <StudentKnowledgeNoteDetail noteId={parsedId} />;
}
