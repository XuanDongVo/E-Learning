package e_learning.server.assignment.policy;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.enums.QuestionType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AssignmentQuestionTypePolicyTest {
    private final AssignmentQuestionTypePolicy policy = new AssignmentQuestionTypePolicy();

    @Test
    void rejectsOrderingAndPreservesLegacyTypes() {
        AppException error = assertThrows(AppException.class,
                () -> policy.requireSupported(QuestionType.ORDERING));
        assertEquals(ErrorCode.ORDERING_NOT_SUPPORTED_IN_ASSIGNMENT, error.getErrorCode());
        assertDoesNotThrow(() -> policy.requireSupported(QuestionType.SINGLE_CHOICE));
        assertDoesNotThrow(() -> policy.requireSupported(QuestionType.CLOZE));
    }
}
