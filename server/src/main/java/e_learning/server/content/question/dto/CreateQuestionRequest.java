package e_learning.server.content.question.dto;

import e_learning.server.question.dto.QuestionWriteRequest;

public class CreateQuestionRequest extends QuestionWriteRequest {
    private Long questionBankId;

    public Long getQuestionBankId() {
        return questionBankId;
    }

    public void setQuestionBankId(Long questionBankId) {
        this.questionBankId = questionBankId;
    }
}
