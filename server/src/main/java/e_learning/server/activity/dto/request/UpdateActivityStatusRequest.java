package e_learning.server.activity.dto.request;

import e_learning.server.activity.enums.ActivityStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateActivityStatusRequest(@NotNull ActivityStatus status) {
}
