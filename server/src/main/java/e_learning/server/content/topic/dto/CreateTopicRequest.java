package e_learning.server.content.topic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateTopicRequest(
        @NotNull Long sectionId,
        @NotBlank @Size(max = 150) String name,
        @Size(max = 1000) String description,
        @PositiveOrZero Integer displayOrder
) {
}
