package e_learning.server.assignmentanalysis.dto.response;

import java.util.List;

/**
 * Type-aware answer breakdown for expand-row UI.
 * <ul>
 *   <li>SINGLE_CHOICE / TRUE_FALSE / MULTIPLE_CHOICE → {@code options}</li>
 *   <li>TYPE_ANSWER / FILL_IN_BLANK → {@code textAnswers} (top normalized strings)</li>
 *   <li>CLOZE → {@code blanks}</li>
 *   <li>MATCHING → {@code matchPairs} (leftKey → right distribution)</li>
 * </ul>
 */
public record QuestionAnswerDistribution(
        String kind,
        List<AnswerDistributionItem> options,
        List<AnswerDistributionItem> textAnswers,
        List<BlankDistribution> blanks,
        List<BlankDistribution> matchPairs,
        int unansweredCount,
        int sampleSize
) {
    public static QuestionAnswerDistribution options(
            List<AnswerDistributionItem> options, int unanswered, int sampleSize) {
        return new QuestionAnswerDistribution(
                "OPTIONS", options, List.of(), List.of(), List.of(), unanswered, sampleSize);
    }

    public static QuestionAnswerDistribution text(
            List<AnswerDistributionItem> answers, int unanswered, int sampleSize) {
        return new QuestionAnswerDistribution(
                "TEXT", List.of(), answers, List.of(), List.of(), unanswered, sampleSize);
    }

    public static QuestionAnswerDistribution cloze(
            List<BlankDistribution> blanks, int unanswered, int sampleSize) {
        return new QuestionAnswerDistribution(
                "CLOZE", List.of(), List.of(), blanks, List.of(), unanswered, sampleSize);
    }

    public static QuestionAnswerDistribution matching(
            List<BlankDistribution> pairs, int unanswered, int sampleSize) {
        return new QuestionAnswerDistribution(
                "MATCHING", List.of(), List.of(), List.of(), pairs, unanswered, sampleSize);
    }

    public static QuestionAnswerDistribution empty(String kind, int sampleSize) {
        return new QuestionAnswerDistribution(
                kind, List.of(), List.of(), List.of(), List.of(), 0, sampleSize);
    }
}
