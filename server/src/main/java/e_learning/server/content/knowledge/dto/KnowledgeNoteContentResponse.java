package e_learning.server.content.knowledge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
public record KnowledgeNoteContentResponse(
    Long knowledgeNoteId, JsonNode document, JsonNode summary,
    int schemaVersion, long editVersion, LocalDateTime updatedAt
) {}
