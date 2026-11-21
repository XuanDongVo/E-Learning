package e_learning.server.knowledge.teacher.dto.response;

import e_learning.server.content.common.enums.ContentStatus;

public record KnowledgeNoteTopicUsageResponse(
        Long topicId, String topicName, Long sectionId, String sectionName,
        Long unitId, String unitName, boolean primary, int displayOrder,
        ContentStatus topicStatus
) {}
