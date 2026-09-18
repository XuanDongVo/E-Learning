package e_learning.server.classmanagement.dto;

import e_learning.server.classmanagement.entity.ClassEntity;

public record ClassResponse(
        Long id,
        String name,
        Short grade,
        String academicYear,
        long studentCount
) {
    public static ClassResponse from(ClassEntity classEntity, long studentCount) {
        return new ClassResponse(classEntity.getId(), classEntity.getName(), classEntity.getGrade(), classEntity.getAcademicYear(), studentCount);
    }
}