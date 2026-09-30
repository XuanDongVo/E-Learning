package e_learning.server.activity.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySourceAvailability {

    private Long questionBankId;

    private String questionBankName;

    private boolean published;

    private long totalQuestions;

    private long readyQuestions;

    private Integer requiredQuestions;
}