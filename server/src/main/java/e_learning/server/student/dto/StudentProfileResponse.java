package e_learning.server.student.dto;

import e_learning.server.student.entity.Gender;
import java.time.LocalDate;
import java.util.List;

public record StudentProfileResponse(
        Long userId, String email, String fullName, LocalDate dateOfBirth, Gender gender,
        String phone, List<StudentGuardianResponse> guardians, StudentClassResponse currentClass,
        String accountStatus
) {}
