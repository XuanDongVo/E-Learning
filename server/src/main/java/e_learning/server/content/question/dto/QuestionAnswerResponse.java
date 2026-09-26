package e_learning.server.content.question.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAnswerResponse {
    private Long id;
    private String rawValue;
    private String normalizedValue;
}
