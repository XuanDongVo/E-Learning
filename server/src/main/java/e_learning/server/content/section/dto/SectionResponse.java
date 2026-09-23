package e_learning.server.content.section.dto;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.section.entity.Section;

import java.time.LocalDateTime;

public record SectionResponse(
        Long id,
        Long unitId,
        String name,
        String description,
        Integer displayOrder,
        Integer totalTopic,
        ContentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static SectionResponse from(
            Section section,
            Integer totalTopic
    ) {
        return new SectionResponse(
                section.getId(),
                section.getUnit().getId(),
                section.getName(),
                section.getDescription(),
                section.getDisplayOrder(),
                totalTopic,
                section.getStatus(),
                section.getCreatedAt(),
                section.getUpdatedAt()
        );
    }
}
