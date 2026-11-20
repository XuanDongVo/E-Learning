package e_learning.server.knowledge.teacher.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public record KnowledgeNoteContentResponse(
        Long knowledgeNoteId,
        Map<String, Object> document,
        LocalDateTime updatedAt
) {}
