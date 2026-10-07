package e_learning.server.student.dto;

import e_learning.server.classes.entity.ClassMember;
import e_learning.server.student.entity.StudentProfile;
import e_learning.server.user.entity.User;

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

    public static StudentSummaryResponse from(
            User student,
            List<ClassMember> memberships,
            StudentProfile profile,
            StudentGuardianResponse primaryGuardian
    ) {
        return new StudentSummaryResponse(
                student.getId(),
                student.getFullName(),
                student.getEmail(),
                profile != null ? profile.getPhone() : null,
                memberships.stream()
                        .map(StudentClassSummary::from)
                        .toList(),
                primaryGuardian,
                student.getStatus().name()
        );
    }
}
