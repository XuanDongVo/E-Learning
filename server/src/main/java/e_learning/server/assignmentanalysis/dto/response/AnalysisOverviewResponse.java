package e_learning.server.assignmentanalysis.dto.response;

import java.util.List;

public record AnalysisOverviewResponse(
        AnalysisSummary summary,
        ProgressCounts progress,
        ScoreSummary score,
        List<ClassComparisonRow> classComparison
) {}
