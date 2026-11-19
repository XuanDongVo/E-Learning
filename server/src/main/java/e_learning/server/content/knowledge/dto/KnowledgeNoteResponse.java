package e_learning.server.content.knowledge.dto;

import e_learning.server.content.knowledge.enums.KnowledgeNoteStatus;
import java.time.LocalDateTime;
/** One current Note document; no published revision / draft flag. */
public record KnowledgeNoteResponse(
    Long id, Long gradeId, String title, String description,
    KnowledgeNoteStatus status, long linkedTopicCount,
    LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime publishedAt
) {}
