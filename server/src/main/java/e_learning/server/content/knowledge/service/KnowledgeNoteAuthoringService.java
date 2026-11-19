package e_learning.server.content.knowledge.service;

import e_learning.server.content.knowledge.dto.*;
import org.springframework.stereotype.Service;

/** Single-document MVP. Business endpoints fail closed pending Phase 01. */
@Service
public class KnowledgeNoteAuthoringService {
    public KnowledgeNotePageResponse<KnowledgeNoteResponse> list(Long gradeId, String status, String search, Boolean linked, int page, int size) {
        return KnowledgeNotePhaseGate.notImplemented();
    }
    public KnowledgeNoteResponse create(CreateKnowledgeNoteRequest request) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse get(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse updateMetadata(Long id, UpdateKnowledgeNoteMetadataRequest request) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteContentResponse getContent(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteContentResponse saveContent(Long id, SaveKnowledgeNoteContentRequest request) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse publish(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse unpublish(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public KnowledgeNoteResponse archive(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
    public java.util.List<KnowledgeNoteTopicLinkResponse> links(Long id) { return KnowledgeNotePhaseGate.notImplemented(); }
}
