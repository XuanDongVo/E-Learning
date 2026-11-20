package e_learning.server.knowledge.teacher.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record SaveKnowledgeNoteContentRequest(
        @NotNull Map<String, Object> document
) {}
