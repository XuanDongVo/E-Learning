package e_learning.server.assignment.dto;

import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;

import java.time.LocalDateTime;
import java.util.List;

public record AssignmentResponse(
        Long id,
        Integer gradeLevel,
        String academicYear,
        String name,
        String description,
        AssignmentStatus status,
        LocalDateTime startAt,
        LocalDateTime dueAt,
        Integer timeLimitSeconds,
        int questionCount,
        List<AssignmentTargetResponse> targets
) {
    public static AssignmentResponse from(Assignment assignment, int questionCount) {
        return new AssignmentResponse(
                assignment.getId(), assignment.getGradeLevel(), assignment.getAcademicYear(),
                assignment.getName(), assignment.getDescription(), assignment.getStatus(),
                assignment.getStartAt(), assignment.getDueAt(), assignment.getTimeLimitSeconds(),
                questionCount, assignment.getTargets().stream().map(AssignmentTargetResponse::from).toList());
    }
}
