package e_learning.server.assignmentanalysis.dto;

import java.util.List;

public record AssignmentAnalysisOverviewResponse(
        AssignmentAnalysisSummaryDto summary,
        ProgressCountsDto progress,
        ScoreSummaryDto score,
        List<ClassComparisonRowDto> classComparison
) {}
