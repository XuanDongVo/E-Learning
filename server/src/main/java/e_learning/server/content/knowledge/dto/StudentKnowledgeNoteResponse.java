package e_learning.server.content.knowledge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
/** Only published revision content may populate this DTO. */
public record StudentKnowledgeNoteResponse(
    Long id, Long gradeId, String title, String description,
    JsonNode summary, JsonNode document, int revisionNumber,
    LocalDateTime publishedAt
) {}
