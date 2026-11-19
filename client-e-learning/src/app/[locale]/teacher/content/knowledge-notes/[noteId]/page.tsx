import { TeacherKnowledgeNoteDetail } from "@/components/features/teacher/knowledge-notes/knowledge-note-detail";

export default async function KnowledgeNoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  return <TeacherKnowledgeNoteDetail noteId={Number(noteId)} />;
}
