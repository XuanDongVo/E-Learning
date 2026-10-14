package e_learning.server.assignment.dto;

import java.util.List;

public record AssignmentCompositionResponse(
        Long assignmentId,
        int schemaVersion,
        String provenance,
        boolean showScoreAfterSubmit,
        boolean showPointsPerQuestion,
        List<CompositionSectionResponse> sections
) {
}
