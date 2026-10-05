package e_learning.server.student.dto;

import e_learning.server.student.entity.Gender;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateStudentProfileRequest(
        @Past LocalDate dateOfBirth,
        Gender gender,
        @Size(max = 30) String phone,
        @Size(max = 150) String fullName
) {}
