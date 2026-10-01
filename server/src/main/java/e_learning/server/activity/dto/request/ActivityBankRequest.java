package e_learning.server.activity.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ActivityBankRequest(
        @NotNull Long questionBankId,
        @NotNull @Min(0) Integer displayOrder,
        @Min(1) Integer percentage,
        @Min(1) Integer fixedCount
) {
}