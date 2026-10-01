package e_learning.server.activity.dto.request;

import e_learning.server.activity.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record CreateActivityRequest(
        @NotNull Long unitId,
        @NotBlank @Size(max = 150) String name,
        @Size(max = 1000) String description,
        @NotNull DistributionMode distributionMode,
        @NotNull @Min(1) Integer totalQuestions,
        @NotNull List<SelectionStrategy> availableSelectionStrategies,
        @NotNull ActivityMode mode,
        @Min(1) Integer timeLimitSeconds,
        @Min(1) Integer lives,
        @NotEmpty List<@Valid ActivityBankRequest> banks
) {
}
