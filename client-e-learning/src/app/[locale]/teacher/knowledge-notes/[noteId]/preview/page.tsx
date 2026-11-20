import { notFound } from "next/navigation";
import { TeacherKnowledgeNotePreviewPage } from "@/components/features/teacher/knowledge-notes/knowledge-note-preview";

export default async function KnowledgeNotePreviewRoute({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const id = Number(noteId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  return <TeacherKnowledgeNotePreviewPage noteId={id} />;
}
