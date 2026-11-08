package e_learning.server.vocabulary.teacher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateWordStatusRequest(
        @NotBlank(message = "Trạng thái không được để trống")
        @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Trạng thái phải là ACTIVE hoặc INACTIVE")
        String status
) {}

