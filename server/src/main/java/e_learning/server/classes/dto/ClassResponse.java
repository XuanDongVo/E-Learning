package e_learning.server.classes.dto;

import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassStatus;

public record ClassResponse(
        Long id,
        String name,
        GradeSummary grade,
        String academicYear,
        long studentCount,
        ClassStatus status
) {
    public static ClassResponse from(ClassEntity classEntity, long studentCount) {
        return new ClassResponse(
                classEntity.getId(),
                classEntity.getName(),
                GradeSummary.from(classEntity.getGrade()),
                classEntity.getAcademicYear(),
                studentCount,
                classEntity.getStatus()
        );
    }

    public record GradeSummary(Long id, String code, String name, Integer displayOrder) {
        public static GradeSummary from(e_learning.server.grades.entity.Grade grade) {
            return new GradeSummary(
                    grade.getId(),
                    grade.getCode(),
                    grade.getName(),
                    grade.getDisplayOrder()
            );
        }
    }
}
