package e_learning.server.content.knowledge.service;

import e_learning.server.content.knowledge.dto.*;
import org.springframework.stereotype.Service;
import java.util.List;

/** Phase 01 service contract. Methods intentionally fail with HTTP 501. */
@Service
public class KnowledgeNoteAuthoringService {
    public KnowledgeNotePageResponse<KnowledgeNoteResponse> list(Long gradeId, String status, String search, Boolean linked, int page, int size) {
        return KnowledgeNotePhaseGate.notImplemented();
    }
    public KnowledgeNoteResponse create(CreateKnowledgeNoteRequest request) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse get(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse updateMetadata(Long id, UpdateKnowledgeNoteMetadataRequest request) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteDraftResponse getDraft(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteDraftResponse saveDraft(Long id, SaveKnowledgeNoteDraftRequest request) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse publish(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse unpublish(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse archive(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public List<KnowledgeNoteRevisionResponse> revisions(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public List<KnowledgeNoteTopicLinkResponse> links(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
}
