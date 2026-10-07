package e_learning.server.student.dto;

import e_learning.server.student.entity.GuardianRelationship;
import e_learning.server.student.entity.StudentGuardian;

public record StudentGuardianResponse(
        Long id,
        GuardianRelationship relationship,
        String fullName,
        String phone,
        String email,
        boolean primary
) {

    public static StudentGuardianResponse from(
            StudentGuardian guardian
    ) {
        return new StudentGuardianResponse(
                guardian.getId(),
                guardian.getRelationship(),
                guardian.getFullName(),
                guardian.getPhone(),
                guardian.getEmail(),
                guardian.isPrimary()
        );
    }
}