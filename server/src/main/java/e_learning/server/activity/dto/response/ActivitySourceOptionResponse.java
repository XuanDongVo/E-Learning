package e_learning.server.activity.dto.response;

import e_learning.server.content.common.enums.ContentStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySourceOptionResponse {
    private Long questionBankId;
    private String questionBankName;
    private Long topicId;
    private String topicName;
    private String sectionName;
    private ContentStatus status;
    private long totalQuestions;
    private long readyQuestions;
}
