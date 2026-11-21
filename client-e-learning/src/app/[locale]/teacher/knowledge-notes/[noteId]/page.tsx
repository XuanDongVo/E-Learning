import { TeacherKnowledgeNoteDetail } from "@/components/features/teacher/knowledge-notes/knowledge-note-detail";
import { notFound } from "next/navigation";

export default async function KnowledgeNoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const parsedNoteId = Number(noteId);
  if (!Number.isSafeInteger(parsedNoteId) || parsedNoteId <= 0) notFound();

  return <TeacherKnowledgeNoteDetail noteId={parsedNoteId} />;
}
