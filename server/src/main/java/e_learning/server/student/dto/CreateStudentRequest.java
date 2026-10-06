package e_learning.server.student.dto;
import e_learning.server.student.entity.Gender;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public record CreateStudentRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min=6,max=100) String password,
        @NotBlank @Size(max=150) String fullName,
        @Past LocalDate dateOfBirth,
        Gender gender,
        @Size(max=30) String phone,
        @NotNull Long classId,
        @Valid List<StudentGuardianRequest> guardians
) {}
