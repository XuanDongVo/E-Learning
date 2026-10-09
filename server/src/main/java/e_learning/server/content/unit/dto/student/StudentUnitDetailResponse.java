package e_learning.server.content.unit.dto.student;

import e_learning.server.content.unit.entity.Unit;

import java.util.List;

public record StudentUnitDetailResponse(
        Long id,
        String code,
        String name,
        String description,
        String coverUrl,
        Integer displayOrder,
        Integer sectionCount,
        Integer activityCount,
        List<StudentSectionResponse> sections,
        List<StudentActivityResponse> activities
) {
    public StudentUnitDetailResponse {
        sections = sections == null ? List.of() : List.copyOf(sections);
        activities = activities == null ? List.of() : List.copyOf(activities);
    }

    public StudentUnitDetailResponse toDetail(
            Unit unit,
            Integer sectionCount,
            Integer activityCount,
            String coverUrl,
            List<StudentSectionResponse> sections,
            List<StudentActivityResponse> activities
    ) {
        return new StudentUnitDetailResponse(
                unit.getId(),
                unit.getCode(),
                unit.getName(),
                unit.getDescription(),
                coverUrl,
                unit.getDisplayOrder(),
                sectionCount,
                activityCount,
                sections,
                activities
        );
    }
}