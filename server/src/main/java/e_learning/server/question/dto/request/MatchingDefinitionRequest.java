package e_learning.server.question.dto.request;

import lombok.Data;

@Data
public class MatchingDefinitionRequest {
    private String poolId;
    private String correctEntryId;
}
