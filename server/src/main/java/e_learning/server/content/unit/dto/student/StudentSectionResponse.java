package e_learning.server.content.unit.dto.student;

import e_learning.server.content.section.entity.Section;

import java.util.List;

public record StudentSectionResponse(
        Long id,
        String name,
        String description,
        List<StudentTopicResponse> topics
) {
    public StudentSectionResponse {
        topics = topics == null ? List.of() : List.copyOf(topics);
    }

    public StudentSectionResponse toSection(
            Section section,
            List<StudentTopicResponse> topics
    ) {
        return new StudentSectionResponse(
                section.getId(),
                section.getName(),
                section.getDescription(),
                topics
        );
    }
}