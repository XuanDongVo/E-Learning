package e_learning.server.content.knowledge.dto;

public record StudentKnowledgeNoteListItemResponse(
    Long id, Long gradeId, String title, String description,
    long linkedTopicCount
) {}
