package e_learning.server.content.common.dto;

import e_learning.server.content.common.enums.ContentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull ContentStatus status) {
}