package e_learning.server.content.question.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkCreateQuestionResponse {
    private int totalCount;
    private int successCount;
    private List<QuestionResponse> createdQuestions;
}
