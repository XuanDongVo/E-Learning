package e_learning.server.knowledge.teacher.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReorderTopicKnowledgeNotesRequest(@NotNull List<@NotNull Long> noteIds) {}
