package e_learning.server.question.dto;

import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionContentResponse {
    private Long id;
    private QuestionType type;
    private Difficulty difficulty;
    private String content;
    private String explanation;
    private String hint;
    private boolean complete;
    private String matchingMode;
    private List<QuestionOptionResponse> options;
    private List<QuestionAnswerResponse> answers;
    private List<QuestionMediaResponse> media;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
