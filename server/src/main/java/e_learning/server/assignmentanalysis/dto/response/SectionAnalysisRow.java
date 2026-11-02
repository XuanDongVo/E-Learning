package e_learning.server.assignmentanalysis.dto.response;

public record SectionAnalysisRow(
        String sectionId,
        String sectionTitle,
        int questionCount,
        int sampleSlots,
        int correctCount,
        int partialCount,
        int incorrectCount,
        int unansweredCount,
        Double accuracyPercent,
        Double scoreRatePercent,
        Double blankPercent
) {}
