package e_learning.server.content.knowledge.service;

import e_learning.server.content.knowledge.dto.*;
import org.springframework.stereotype.Service;
import java.util.List;

/** Phase 01 optional many-to-many Topic association contract. */
@Service
public class KnowledgeNoteTopicLinkService {
    public List<KnowledgeNoteTopicLinkResponse> list(Long topicId) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteTopicLinkResponse attach(Long topicId, AttachKnowledgeNoteRequest request) { return KnowledgeNotePhaseGate.notImplemented(); }
    public void detach(Long topicId, Long noteId) { KnowledgeNotePhaseGate.notImplemented(); }
    public void setPrimary(Long topicId, SetPrimaryKnowledgeNoteRequest request) { KnowledgeNotePhaseGate.notImplemented(); }
    public void reorder(Long topicId, ReorderKnowledgeNoteLinksRequest request) { KnowledgeNotePhaseGate.notImplemented(); }
}
