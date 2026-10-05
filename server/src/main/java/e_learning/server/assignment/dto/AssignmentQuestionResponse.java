package e_learning.server.assignment.dto;

import e_learning.server.question.dto.QuestionContentResponse;

public record AssignmentQuestionResponse(
        Long questionId,
        Long assignmentId,
        QuestionContentResponse question
) {
}
