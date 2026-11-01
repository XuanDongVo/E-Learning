package e_learning.server.assignmentanalysis.dto;

import java.util.List;

public record QuestionAnalysisListResponse(
        List<QuestionAnalysisRowDto> items
) {}
