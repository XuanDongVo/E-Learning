package e_learning.server.assignment.dto;

import e_learning.server.assignment.enums.AssignmentTargetType;
import jakarta.validation.constraints.NotNull;

public record AssignmentTargetRequest(
        @NotNull AssignmentTargetType type,
        Long classId
) {
}
