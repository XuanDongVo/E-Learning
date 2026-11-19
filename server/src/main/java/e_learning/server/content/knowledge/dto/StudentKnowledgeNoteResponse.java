package e_learning.server.content.knowledge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
public record StudentKnowledgeNoteResponse(
    Long id, Long gradeId, String title, String description,
    JsonNode summary, JsonNode document,
    LocalDateTime publishedAt
) {}
