package e_learning.server.content.knowledge.access;

import e_learning.server.content.knowledge.service.KnowledgeNotePhaseGate;
import org.springframework.stereotype.Component;

/** Phase 01 security seam. Call before returning a Note or mutating a Topic link. */
@Component
public class KnowledgeNoteAccessPolicy {
    public void requireTeacherNoteAccess(Long noteId) { KnowledgeNotePhaseGate.notImplemented(); }
    public void requireTeacherTopicAccess(Long topicId) { KnowledgeNotePhaseGate.notImplemented(); }
    public void requireStudentPublishedGradeAccess(Long noteId) { KnowledgeNotePhaseGate.notImplemented(); }
}
