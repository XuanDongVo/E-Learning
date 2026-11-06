package e_learning.server.activitysession.snapshot;

import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.question.engine.exception.QuestionEngineException;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.question.service.QuestionSpecMapper;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class ActivityQuestionSnapshotAssemblerXpTest {
    private final ActivityQuestionSnapshotAssembler assembler = new ActivityQuestionSnapshotAssembler(
            mock(QuestionOptionRepository.class),
            mock(QuestionAnswerRepository.class),
            mock(QuestionSpecMapper.class),
            mock(ObjectMapper.class));

    @Test
    void acceptsOnlySchemaV2SnapshotWithFrozenDifficulty() {
        assertDoesNotThrow(() -> assembler.requireXpEligible(snapshot(2, Difficulty.EASY)));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(snapshot(1, Difficulty.EASY)));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(snapshot(2, null)));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(null));
    }

    private static ActivityQuestionSnapshot snapshot(int schemaVersion, Difficulty difficulty) {
        return new ActivityQuestionSnapshot(
                schemaVersion, 1L, QuestionType.SINGLE_CHOICE, difficulty,
                "Question", null, null, null, List.of(), List.of(), "{}");
    }
}
