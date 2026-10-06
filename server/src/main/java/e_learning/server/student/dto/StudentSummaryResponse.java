package e_learning.server.student.dto;

import java.util.List;

public record StudentSummaryResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        List<StudentClassSummary> classes,
        StudentGuardianResponse primaryGuardian,
        String accountStatus
) {
}
