package e_learning.server.activity.dto.request;

import e_learning.server.activity.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record UpdateActivityRequest(

        @NotNull
        Long topicId,

        @NotBlank
        @Size(max = 150)
        String name,

        @Size(max = 1000)
        String description,

        @NotNull
        DistributionMode distributionMode,

        @NotNull
        @Min(1)
        Integer totalQuestions,

        @NotNull
        SelectionStrategy selectionStrategy,

        @NotNull
        ActivityMode mode,

        @Min(1)
        Integer timeLimitSeconds,

        @Min(1)
        Integer lives,

        Long gameTemplateId,

        @NotEmpty
        List<@Valid ActivityBankRequest> banks
) {
}