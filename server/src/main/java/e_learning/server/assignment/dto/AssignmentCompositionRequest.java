package e_learning.server.assignment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AssignmentCompositionRequest(
        @NotEmpty List<@Valid CompositionSectionRequest> sections,
        Boolean showScoreAfterSubmit,
        Boolean showPointsPerQuestion
) {
}
