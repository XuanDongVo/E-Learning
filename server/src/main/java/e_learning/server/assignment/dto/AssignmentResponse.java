package e_learning.server.assignment.dto;

import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.grades.entity.Grade;

import java.time.LocalDateTime;
import java.util.List;

public record AssignmentResponse(
        Long id,
        GradeSummary grade,
        String academicYear,
        String name,
        String description,
        AssignmentStatus status,
        LocalDateTime startAt,
        LocalDateTime dueAt,
        Integer timeLimitSeconds,
        boolean showAnswersAfterSubmit,
        int questionCount,
        List<Long> classIds
) {
    public static AssignmentResponse from(Assignment assignment, int questionCount) {
        return new AssignmentResponse(
                assignment.getId(), GradeSummary.from(assignment.getGrade()), assignment.getAcademicYear(),
                assignment.getName(), assignment.getDescription(), assignment.getStatus(),
                assignment.getStartAt(), assignment.getDueAt(), assignment.getTimeLimitMinutes(),
                assignment.isShowAnswersAfterSubmit(),
                questionCount, assignment.getClassIds());
    }

    public record GradeSummary(Long id, String code, String name, Integer displayOrder) {
        public static GradeSummary from(Grade grade) {
            return new GradeSummary(grade.getId(), grade.getCode(), grade.getName(), grade.getDisplayOrder());
        }
    }
}
