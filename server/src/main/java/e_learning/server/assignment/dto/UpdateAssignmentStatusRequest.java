package e_learning.server.assignment.dto;

import e_learning.server.assignment.enums.AssignmentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAssignmentStatusRequest(
        @NotNull AssignmentStatus status
) {
}
