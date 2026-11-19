package e_learning.server.content.knowledge.validation;

import com.fasterxml.jackson.databind.JsonNode;
import e_learning.server.content.knowledge.service.KnowledgeNotePhaseGate;
import org.springframework.stereotype.Component;

/** Phase 01/02 seam: allowlisted schema, no arbitrary HTML/image nodes. */
@Component
public class KnowledgeNoteDocumentValidator {
    public void validateDraft(JsonNode document, JsonNode summary, Integer schemaVersion) {
        KnowledgeNotePhaseGate.notImplemented();
    }
    public void validatePublish(JsonNode document, JsonNode summary, boolean linkedAsPrimary, Integer schemaVersion) {
        KnowledgeNotePhaseGate.notImplemented();
    }
}
