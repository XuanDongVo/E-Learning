import { TeacherKnowledgeNoteEditor } from "@/components/features/teacher/knowledge-notes/knowledge-note-editor";
export default async function EditKnowledgeNotePage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  return <TeacherKnowledgeNoteEditor noteId={Number(noteId)} />;
}
