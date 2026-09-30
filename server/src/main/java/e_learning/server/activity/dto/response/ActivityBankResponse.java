package e_learning.server.activity.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityBankResponse {

    private Long id;

    private Long questionBankId;
    private String questionBankName;

    private Long topicId;
    private String topicName;

    private Integer displayOrder;

    private Integer percentage;

    private Integer fixedCount;

    private Long totalQuestions;
    private Long readyQuestions;
}