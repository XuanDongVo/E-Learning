package e_learning.server.knowledge.teacher.mapper;

import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.teacher.dto.response.KnowledgeNoteResponse;
import org.springframework.stereotype.Component;

@Component
public class KnowledgeNoteMapper {
    public KnowledgeNoteResponse toResponse(KnowledgeNote note, long linkedTopicCount) {
        return new KnowledgeNoteResponse(
            note.getId(), note.getGrade().getId(),
            note.getTitle(), note.getDescription(), note.getStatus(), linkedTopicCount,
            note.getCreatedAt(), note.getUpdatedAt(), note.getPublishedAt()
        );
    }
}
