package e_learning.server.assignment.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkDeleteAssignmentQuestionsRequest(
        @NotEmpty List<Long> ids
) {
}