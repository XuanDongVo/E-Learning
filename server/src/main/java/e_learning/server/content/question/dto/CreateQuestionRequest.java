package e_learning.server.content.question.dto;

import e_learning.server.question.dto.QuestionWriteRequest;
import jakarta.validation.constraints.NotNull;

public class CreateQuestionRequest extends QuestionWriteRequest {
    @NotNull(message = "Question bank ID is required")
    private Long questionBankId;

    public Long getQuestionBankId() {
        return questionBankId;
    }

    public void setQuestionBankId(Long questionBankId) {
        this.questionBankId = questionBankId;
    }
}
