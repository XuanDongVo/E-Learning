package e_learning.server.assignment.dto;

import e_learning.server.assignment.entity.AssignmentTarget;
import e_learning.server.assignment.enums.AssignmentTargetType;

public record AssignmentTargetResponse(
        AssignmentTargetType type,
        Long classId,
        String className
) {
    public static AssignmentTargetResponse from(AssignmentTarget target) {
        return new AssignmentTargetResponse(
                target.getTargetType(),
                target.getClassEntity() == null ? null : target.getClassEntity().getId(),
                target.getClassEntity() == null ? null : target.getClassEntity().getName());
    }
}
