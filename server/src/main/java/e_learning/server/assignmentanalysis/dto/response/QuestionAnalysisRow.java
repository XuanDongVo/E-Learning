package e_learning.server.assignmentanalysis.dto.response;

public record QuestionAnalysisRow(
        String questionId,
        int position,
        String sectionId,
        String sectionTitle,
        String promptPreview,
        String questionType,
        boolean isExample,
        int attemptCount,
        int correctCount,
        int partialCount,
        int incorrectCount,
        int unansweredCount,
        Double accuracyPercent,
        Double scoreRatePercent
) {}
