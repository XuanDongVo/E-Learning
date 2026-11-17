package e_learning.server.assignment.policy;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.enums.QuestionType;
import org.springframework.stereotype.Component;

@Component
public class AssignmentQuestionTypePolicy {
    public void requireSupported(QuestionType type) {
        if (type == QuestionType.ORDERING) {
            throw new AppException(ErrorCode.ORDERING_NOT_SUPPORTED_IN_ASSIGNMENT);
        }
    }
}
