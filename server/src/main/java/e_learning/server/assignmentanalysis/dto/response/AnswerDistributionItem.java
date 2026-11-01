package e_learning.server.assignmentanalysis.dto.response;

/** One bucket in a type-specific answer distribution. */
public record AnswerDistributionItem(
        String key,
        String label,
        int count,
        boolean correct
) {}
