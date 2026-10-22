package e_learning.server.question.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class QuestionOptionRequest {
    private String content;

    @JsonProperty("isCorrect")
    private boolean correct;
}
