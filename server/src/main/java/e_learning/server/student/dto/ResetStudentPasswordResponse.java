package e_learning.server.student.dto;

public record ResetStudentPasswordResponse(
        Long studentId,
        String temporaryPassword
) {}
