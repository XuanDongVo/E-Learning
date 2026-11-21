package e_learning.server.knowledge.student.dto;

/** Exposes only PUBLISHED Topics in the authenticated Student's Grade. */
public record StudentKnowledgeTopicTag(
        Long topicId, String topicName,
        Long unitId, String unitCode, String unitName,
        boolean primary
) {}
