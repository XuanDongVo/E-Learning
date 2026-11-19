package e_learning.server.content.knowledge.dto;

import e_learning.server.content.knowledge.enums.KnowledgeNoteStatus;
public record KnowledgeNoteTopicLinkResponse(
    Long knowledgeNoteId, Long topicId, String title,
    KnowledgeNoteStatus status, boolean isPrimary, int displayOrder
) {}
