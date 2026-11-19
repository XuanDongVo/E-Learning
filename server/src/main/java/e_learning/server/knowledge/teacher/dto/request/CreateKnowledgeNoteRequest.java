package e_learning.server.knowledge.teacher.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateKnowledgeNoteRequest(
    @NotNull @Positive Long gradeId,
    @NotBlank @Size(max = 200) String title,
    @Size(max = 1000) String description
) {}
