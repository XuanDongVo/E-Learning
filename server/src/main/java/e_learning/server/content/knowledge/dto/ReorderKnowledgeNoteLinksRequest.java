package e_learning.server.content.knowledge.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
public record ReorderKnowledgeNoteLinksRequest(@NotNull List<@Valid Item> items) {
    public record Item(@NotNull Long knowledgeNoteId, @PositiveOrZero int displayOrder) {}
}
