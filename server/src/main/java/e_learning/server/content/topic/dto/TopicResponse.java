package e_learning.server.content.topic.dto;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.topic.entity.Topic;

import java.time.LocalDateTime;

public record TopicResponse(
        Long id,
        Long sectionId,
        String name,
        String description,
        Integer displayOrder,
        Integer totalQuestionBank,
        ContentStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TopicResponse from(Topic topic, Integer totalQuestionBank) {
        return new TopicResponse(topic.getId(), topic.getSection().getId(), topic.getName(), topic.getDescription(), topic.getDisplayOrder(), totalQuestionBank, topic.getStatus(), topic.getCreatedAt(), topic.getUpdatedAt());
    }
}
