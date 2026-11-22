package e_learning.server.knowledge.student.dto;

import java.util.List;
import java.util.Map;

/**
 * Topic-scoped, authorized read projection. Quick Summary blocks are selected
 * from the published Primary document at read time, never stored separately.
 */
public record StudentTopicKnowledgeResponse(
        Long topicId,
        PrimaryNote primary,
        List<ReadingNote> supplementary
) {
    public record ReadingNote(Long id, String title, String description) {}
    public record PrimaryNote(
            Long id, String title, String description,
            Map<String, Object> summaryDocument, int totalKeyPoints
    ) {}
}
