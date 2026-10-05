package e_learning.server.student.dto;

import e_learning.server.student.entity.GuardianRelationship;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudentGuardianRequest(
        Long id,
        @NotNull GuardianRelationship relationship,
        @NotBlank @Size(max = 150) String fullName,
        @NotBlank @Size(max = 30) String phone,
        @Email @Size(max = 255) String email,
        boolean primary
) {}
