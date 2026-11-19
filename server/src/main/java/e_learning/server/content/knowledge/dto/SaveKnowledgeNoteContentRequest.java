package e_learning.server.content.knowledge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
public record SaveKnowledgeNoteContentRequest(
    @NotNull @Min(0) Long baseVersion,
    @NotNull JsonNode document,
    JsonNode summary,
    @NotNull @Min(1) Integer schemaVersion
) {}
