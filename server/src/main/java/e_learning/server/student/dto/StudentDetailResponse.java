package e_learning.server.student.dto;

import e_learning.server.student.entity.Gender;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Teacher-facing student identity + current membership snapshot.
 * Learning aggregates (assignments/activities) are separate endpoints.
 */
public record StudentDetailResponse(
        Long id,
        String fullName,
        LocalDate dateOfBirth,
        Gender gender,
        String email,
        String phone,
        List<StudentGuardianResponse> guardians,
        Long classId,
        String className,
        Long gradeId,
        String gradeName,
        String academicYear,
        String membershipStatus,
        LocalDateTime joinedAt,
        String accountStatus
) {}
