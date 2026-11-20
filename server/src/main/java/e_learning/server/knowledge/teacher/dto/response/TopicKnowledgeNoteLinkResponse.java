package e_learning.server.knowledge.teacher.dto.response;

import e_learning.server.knowledge.enums.KnowledgeNoteStatus;

public record TopicKnowledgeNoteLinkResponse(
        Long noteId, Long linkId, Long gradeId, String title, String description,
        KnowledgeNoteStatus status, boolean primary, int displayOrder
) {}
