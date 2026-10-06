package e_learning.server.student.dto;

public record StudentClassSummary(
        Long id,
        String name,
        Long gradeId,
        String gradeName,
        String academicYear,
        String status
) {
}
