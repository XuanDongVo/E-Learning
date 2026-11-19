package e_learning.server.content.knowledge.dto;

import e_learning.server.content.knowledge.enums.KnowledgeNoteStatus;
import java.time.LocalDateTime;
/** Teacher-facing metadata; content lives in KnowledgeNoteDraftResponse. */
public record KnowledgeNoteResponse(
    Long id, Long gradeId, String title, String description,
    KnowledgeNoteStatus status, Long publishedRevisionId,
    long linkedTopicCount, boolean hasUnpublishedChanges,
    LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime publishedAt
) {}
