package e_learning.server.activity.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityReadinessResponse {
    private boolean ready;
    private List<ReadinessIssue> errors;
    private List<ReadinessIssue> warnings;
    private List<ActivitySourceAvailability> sources;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadinessIssue {
        private String code;
        private String message;
        private Long questionBankId;
        private Integer required;
        private Long available;
    }
}
