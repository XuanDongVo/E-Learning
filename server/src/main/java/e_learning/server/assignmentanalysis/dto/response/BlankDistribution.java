package e_learning.server.assignmentanalysis.dto.response;

import java.util.List;

/** Per-blank distribution for CLOZE / multi-blank text. */
public record BlankDistribution(
        String blankKey,
        String blankLabel,
        List<AnswerDistributionItem> answers,
        int blankCount
) {}
