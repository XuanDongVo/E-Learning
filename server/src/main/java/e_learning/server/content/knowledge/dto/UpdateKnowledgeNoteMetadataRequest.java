package e_learning.server.content.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record UpdateKnowledgeNoteMetadataRequest(
    @NotNull Long gradeId,
    @NotBlank @Size(max = 200) String title,
    @Size(max = 1000) String description
) {}
