package e_learning.server.content.knowledge.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record SaveKnowledgeNoteDraftRequest(
    @NotNull @Min(0) Long baseVersion,
    @NotNull JsonNode document,
    JsonNode summary,
    @NotNull @Min(1) Integer schemaVersion,
    @Size(max = 200) String title,
    @Size(max = 1000) String description
) {}
