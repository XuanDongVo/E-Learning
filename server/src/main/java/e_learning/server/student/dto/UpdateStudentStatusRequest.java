package e_learning.server.student.dto;

import e_learning.server.user.entity.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStudentStatusRequest(
        @NotNull UserStatus status
) {
}
