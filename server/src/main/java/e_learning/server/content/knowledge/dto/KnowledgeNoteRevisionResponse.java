package e_learning.server.content.knowledge.dto;

import java.time.LocalDateTime;
public record KnowledgeNoteRevisionResponse(
    Long id, Long knowledgeNoteId, int revisionNumber,
    String title, LocalDateTime publishedAt
) {}
