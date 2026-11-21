package e_learning.server.knowledge.teacher.dto.request;

import jakarta.validation.constraints.NotNull;

public record LinkKnowledgeNoteRequest(
        @NotNull Long noteId,
        @NotNull Boolean primary
) {}
