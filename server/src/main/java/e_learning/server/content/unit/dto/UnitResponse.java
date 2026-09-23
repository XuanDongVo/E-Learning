package e_learning.server.content.unit.dto;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.unit.entity.Unit;

import java.time.LocalDateTime;

public record UnitResponse(
        Long id,
        Long gradeId,
        String code,
        String name,
        String description,
        String coverUrl,
        Integer displayOrder,
        Integer totalSection,
        Integer totalTopic,
        ContentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime publishedAt
) {

    public static UnitResponse from(
            Unit unit,
            Integer totalSection,
            Integer totalTopic,
            String coverUrl
    ) {
        return new UnitResponse(
                unit.getId(),
                unit.getGrade().getId(),
                unit.getCode(),
                unit.getName(),
                unit.getDescription(),
                coverUrl,
                unit.getDisplayOrder(),
                totalSection,
                totalTopic,
                unit.getStatus(),
                unit.getCreatedAt(),
                unit.getUpdatedAt(),
                unit.getPublishedAt()
        );
    }
}