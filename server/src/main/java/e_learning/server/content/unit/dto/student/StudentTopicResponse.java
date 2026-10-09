package e_learning.server.content.unit.dto.student;

import e_learning.server.content.topic.entity.Topic;

public record StudentTopicResponse(
        Long id,
        String name
) {
    public StudentTopicResponse toTopic(Topic topic) {
        return new StudentTopicResponse(
                topic.getId(),
                topic.getName()
        );
    }
}