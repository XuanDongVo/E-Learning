package e_learning.server.content.knowledge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
public record StudentTopicKnowledgeNotesResponse(
    Long topicId, Primary primary, List<Supplementary> supplementary
) {
    public record Primary(Long id, String title, JsonNode summary) {}
    public record Supplementary(Long id, String title) {}
}
