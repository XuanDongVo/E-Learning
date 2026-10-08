package e_learning.server.content.question.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.dto.QuestionAnswerResponse;
import e_learning.server.question.dto.QuestionMediaResponse;
import e_learning.server.question.dto.QuestionOptionResponse;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long questionBankId;
    private QuestionType type;
    private Difficulty difficulty;
    private String content;
    private String explanation;
    private String hint;
    @JsonProperty("complete")
    private boolean complete;
    @JsonProperty("is_complete")
    public boolean getIsComplete() { return complete; }
    private String matchingMode;
    private List<QuestionOptionResponse> options;
    private List<QuestionAnswerResponse> answers;
    private List<QuestionMediaResponse> media;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}