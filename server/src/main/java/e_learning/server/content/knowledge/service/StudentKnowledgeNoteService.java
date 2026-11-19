package e_learning.server.content.knowledge.service;

import e_learning.server.content.knowledge.dto.*;
import org.springframework.stereotype.Service;

/** Phase 04 Student projections: published and grade-authorized only. */
@Service
public class StudentKnowledgeNoteService {
    public KnowledgeNotePageResponse<StudentKnowledgeNoteListItemResponse> list(Long gradeId, Long unitId, String search, int page, int size) {
        return KnowledgeNotePhaseGate.notImplemented();
    }
    public StudentKnowledgeNoteResponse get(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public StudentTopicKnowledgeNotesResponse topic(Long topicId) { return KnowledgeNotePhaseGate.notImplemented(); }
}
