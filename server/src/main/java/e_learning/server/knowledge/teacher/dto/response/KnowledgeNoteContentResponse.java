package e_learning.server.knowledge.teacher.dto.response;

import java.time.LocalDateTime;
import java.util.Map;

public record KnowledgeNoteContentResponse(
        Long knowledgeNoteId,
        Integer schemaVersion,
        Map<String, Object> document,
        Map<String, Object> summary,
        LocalDateTime updatedAt
) {}
