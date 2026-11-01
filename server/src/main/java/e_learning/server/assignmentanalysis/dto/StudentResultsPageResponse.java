package e_learning.server.assignmentanalysis.dto;

import java.util.List;

public record StudentResultsPageResponse(
        List<StudentResultRowDto> items,
        PageMetaDto meta
) {}
