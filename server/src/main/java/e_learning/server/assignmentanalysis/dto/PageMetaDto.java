package e_learning.server.assignmentanalysis.dto;

public record PageMetaDto(
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
