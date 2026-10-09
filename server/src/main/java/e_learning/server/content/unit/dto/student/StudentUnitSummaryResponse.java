package e_learning.server.content.unit.dto.student;

import e_learning.server.content.unit.entity.Unit;

public record StudentUnitSummaryResponse(
        Long id,
        String code,
        String name,
        String description,
        String coverUrl,
        Integer displayOrder,
        Integer sectionCount,
        Integer activityCount
) {
    public StudentUnitSummaryResponse toSummary(
            Unit unit,
            Integer sectionCount,
            Integer activityCount,
            String coverUrl
    ) {
        return new StudentUnitSummaryResponse(
                unit.getId(),
                unit.getCode(),
                unit.getName(),
                unit.getDescription(),
                coverUrl,
                unit.getDisplayOrder(),
                sectionCount,
                activityCount
        );
    }
}