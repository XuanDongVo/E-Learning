package e_learning.server.content.question.dto;

import e_learning.server.question.dto.QuestionWriteRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class CreateQuestionRequest extends QuestionWriteRequest {
    @NotNull(message = "Question bank ID is required")
    private Long questionBankId;

    public void setQuestionBankId(Long questionBankId) {
        this.questionBankId = questionBankId;
    }
}
