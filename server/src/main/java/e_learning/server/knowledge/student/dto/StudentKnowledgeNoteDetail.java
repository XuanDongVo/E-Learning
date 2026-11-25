package e_learning.server.knowledge.student.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

public record StudentKnowledgeNoteDetail(
        Long id, String title, String description,
        LocalDateTime updatedAt, Map<String, Object> document,
        List<StudentKnowledgeTopicTag> linkedTopics
) {}
