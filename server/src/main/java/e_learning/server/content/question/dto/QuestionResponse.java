package e_learning.server.content.question.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import e_learning.server.content.common.enums.Difficulty;
import e_learning.server.content.common.enums.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @JsonProperty("complete")
    private boolean complete;

    @JsonProperty("is_complete")
    public boolean getIsComplete() {
        return complete;
    }

    private String matchingMode;

    private List<QuestionOptionResponse> options;
    private List<QuestionAnswerResponse> answers;
    private List<QuestionMediaResponse> media;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
