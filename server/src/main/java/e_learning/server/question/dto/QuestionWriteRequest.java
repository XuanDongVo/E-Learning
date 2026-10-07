package e_learning.server.question.dto;

import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionWriteRequest {

    @NotNull(message = "Question type is required")
    private QuestionType type;

    private Difficulty difficulty;

    @NotBlank(message = "Question content is required")
    @Size(max = 2000, message = "Question content must not exceed 2000 characters")
    private String content;

    @Size(max = 2000, message = "Explanation must not exceed 2000 characters")
    private String explanation;

    @Size(max = 1000, message = "Hint must not exceed 1000 characters")
    private String hint;

    private List<QuestionOptionRequest> options;
    private List<QuestionAnswerRequest> answers;
    private List<Long> mediaIds;
}
