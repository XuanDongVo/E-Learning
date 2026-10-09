package e_learning.server.activitysession.dto;

import e_learning.server.question.enums.QuestionType;
import java.time.LocalDateTime;
import java.util.List;

public record ActivitySessionQuestionResponse(
        Long id, int position, QuestionType type, String content,
        List<Option> options, LocalDateTime deadlineAt, boolean resolved,
        int answerAttempts, Boolean firstCorrect, Boolean finalCorrect, boolean hintUsed, boolean hasHint) {
    public record Option(String key, String content) {}
}
