package e_learning.server.student.dto;

import jakarta.validation.constraints.Size;

/** Optional new password; when blank/null the server generates a temporary password. */
public record ResetStudentPasswordRequest(
        @Size(min = 6, max = 100) String newPassword
) {}
