package e_learning.server.grades.dto;

import e_learning.server.grades.entity.Grade;

public record GradeResponse(Long id, String code, String name, Integer displayOrder, String status) {
    public static GradeResponse from(Grade grade) {
        return new GradeResponse(
                grade.getId(),
                grade.getCode(),
                grade.getName(),
                grade.getDisplayOrder(),
                grade.getStatus().name()
        );
    }
}