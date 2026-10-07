package e_learning.server.student.dto;

import e_learning.server.classes.entity.ClassMember;

public record StudentClassSummary(
        Long id,
        String name,
        Long gradeId,
        String gradeName,
        String academicYear,
        String status
) {

    public static StudentClassSummary from(ClassMember member) {
        var classEntity = member.getClassEntity();

        return new StudentClassSummary(
                classEntity.getId(),
                classEntity.getName(),
                classEntity.getGrade().getId(),
                classEntity.getGrade().getName(),
                classEntity.getAcademicYear(),
                member.getStatus()
        );
    }
}