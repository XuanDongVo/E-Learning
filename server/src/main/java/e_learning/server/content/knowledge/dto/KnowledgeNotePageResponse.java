package e_learning.server.content.knowledge.dto;

import java.util.List;
public record KnowledgeNotePageResponse<T>(
    List<T> items, int page, int size, long totalElements, int totalPages
) {}
