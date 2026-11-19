package e_learning.server.content.knowledge.mapper;

import e_learning.server.content.knowledge.dto.KnowledgeNoteResponse;
import e_learning.server.content.knowledge.entity.KnowledgeNote;
import e_learning.server.content.knowledge.service.KnowledgeNotePhaseGate;
import org.springframework.stereotype.Component;

/** Planned DTO mapper; no unfinished projections are exposed. */
@Component
public class KnowledgeNoteMapper {
    public KnowledgeNoteResponse toTeacherResponse(KnowledgeNote note) {
        return KnowledgeNotePhaseGate.notImplemented();
    }
}
