import { TeacherKnowledgeNoteEditor } from "@/components/features/teacher/knowledge-notes/knowledge-note-editor";
import { notFound } from "next/navigation";

export default async function EditKnowledgeNotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const parsedNoteId = Number(noteId);
  if (!Number.isSafeInteger(parsedNoteId) || parsedNoteId <= 0) notFound();

  return <TeacherKnowledgeNoteEditor noteId={parsedNoteId} />;
}
