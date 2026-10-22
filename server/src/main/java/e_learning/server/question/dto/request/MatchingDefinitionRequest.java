package e_learning.server.question.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MatchingDefinitionRequest {
    @NotBlank
    private String poolId;
    @NotBlank
    private String correctEntryId;
}
