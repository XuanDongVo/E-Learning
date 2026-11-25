package e_learning.server.knowledge.teacher.dto.response;

import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import java.time.LocalDateTime;

public record KnowledgeNoteResponse(
    Long id, Long gradeId, String title, String description,
    KnowledgeNoteStatus status, long linkedTopicCount,
    LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime publishedAt
) {}
