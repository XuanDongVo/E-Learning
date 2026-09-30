package e_learning.server.activity.dto.request;

import e_learning.server.activity.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ActivityPreviewRequest(
    @NotNull Long unitId,
    String name,
    String description,
    DistributionMode distributionMode,
    Integer totalQuestions,
    SelectionStrategy selectionStrategy,
    ActivityMode mode,
    Integer timeLimitSeconds,
    Integer lives,
    List<@Valid ActivityBankRequest> banks
) {
}
