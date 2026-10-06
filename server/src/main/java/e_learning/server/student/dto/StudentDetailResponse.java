package e_learning.server.student.dto;
import e_learning.server.student.entity.Gender;
import java.time.LocalDate;
import java.util.List;
public record StudentDetailResponse(Long id, String fullName, LocalDate dateOfBirth, Gender gender, String email, String phone, List<StudentGuardianResponse> guardians, Long classId, String className, String classStatus, String accountStatus) {}
