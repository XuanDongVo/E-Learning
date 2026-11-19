package e_learning.server.content.knowledge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
public record KnowledgeNoteDraftResponse(
    Long knowledgeNoteId, String title, String description,
    JsonNode summary, JsonNode document, int schemaVersion,
    long editVersion, LocalDateTime updatedAt
) {}
