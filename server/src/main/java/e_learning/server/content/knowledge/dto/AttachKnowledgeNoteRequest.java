package e_learning.server.content.knowledge.dto;

import jakarta.validation.constraints.NotNull;
public record AttachKnowledgeNoteRequest(
    @NotNull Long knowledgeNoteId,
    boolean isPrimary
) {}
