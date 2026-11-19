import { StudentKnowledgeNoteDetail } from "@/components/features/student/knowledge/student-knowledge-note-detail";
export default async function KnowledgeNoteDetailPage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  return <StudentKnowledgeNoteDetail noteId={Number(noteId)} />;
}
