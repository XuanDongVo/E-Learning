package e_learning.server.activity.service;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.ActivityPracticeType;
import e_learning.server.activity.enums.DistributionMode;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.common.exception.AppException;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class ActivityValidationServiceGuidedReasoningTest {
    private final ActivityValidationService service = new ActivityValidationService(mock(QuestionBankRepository.class));
    private final Unit unit = mock(Unit.class);

    @Test
    void guidedReasoningAcceptsOnlyLearningWithRandomSelection() {
        assertDoesNotThrow(() -> service.validateActivity(unit, DistributionMode.EQUAL, 1,
                List.of(SelectionStrategy.RANDOM), ActivityMode.LEARNING,
                ActivityPracticeType.GUIDED_REASONING, null, null, List.of()));
    }

    @Test
    void guidedReasoningRejectsTryHardEvenWhenItsFieldsAreConfigured() {
        assertThrows(AppException.class, () -> service.validateActivity(unit, DistributionMode.EQUAL, 1,
                List.of(SelectionStrategy.RANDOM), ActivityMode.TRY_HARD,
                ActivityPracticeType.GUIDED_REASONING, 30, 3, List.of()));
    }

    @Test
    void guidedReasoningRejectsWeaknessPriority() {
        assertThrows(AppException.class, () -> service.validateActivity(unit, DistributionMode.EQUAL, 1,
                List.of(SelectionStrategy.WEAKNESS_PRIORITY), ActivityMode.LEARNING,
                ActivityPracticeType.GUIDED_REASONING, null, null, List.of()));
    }
}
