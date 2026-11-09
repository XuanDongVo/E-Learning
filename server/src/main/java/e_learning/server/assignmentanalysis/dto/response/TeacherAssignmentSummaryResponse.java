package e_learning.server.assignmentanalysis.dto.response;

public record TeacherAssignmentSummaryResponse(
        int openAssignmentCount,
        int finalizedDeliveryCount,
        int overdueIncompleteDeliveryCount,
        int dueDeliveryCount,
        int finalizedDueDeliveryCount,
        Double resultRate
) {
}
