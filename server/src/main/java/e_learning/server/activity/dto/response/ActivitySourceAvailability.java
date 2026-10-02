package e_learning.server.activity.dto.response;

import e_learning.server.content.common.enums.ContentStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySourceAvailability {
    private Long questionBankId;
    private String questionBankName;
    private String sectionName;
    private String topicName;
    private ContentStatus status;
    private long totalQuestions;
    private long readyQuestions;
    private Integer requiredQuestions;
}
