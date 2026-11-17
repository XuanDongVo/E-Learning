package e_learning.server.activitysession.snapshot;

import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import e_learning.server.activitysession.ordering.OrderingRuntimeService;
import e_learning.server.activitysession.ordering.OrderingRuntimeSnapshot;
import e_learning.server.question.engine.exception.QuestionEngineException;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.engine.types.ordering.OrderingSubtype;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.question.service.QuestionSpecMapper;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class ActivityQuestionSnapshotAssemblerXpTest {
    private final ActivityQuestionSnapshotAssembler assembler = new ActivityQuestionSnapshotAssembler(
            mock(QuestionOptionRepository.class),
            mock(QuestionAnswerRepository.class),
            mock(QuestionSpecMapper.class),
            mock(ObjectMapper.class),
            mock(OrderingRuntimeService.class));

    @Test
    void acceptsOnlyExplicitlyCompatibleSnapshotsWithFrozenDifficulty() {
        assertDoesNotThrow(() -> assembler.requireXpEligible(snapshot(2, Difficulty.EASY)));
        assertDoesNotThrow(() -> assembler.requireXpEligible(orderingSnapshot(Difficulty.EASY)));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(snapshot(1, Difficulty.EASY)));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(snapshot(2, null)));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(null));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(new ActivityQuestionSnapshot(
                        3, 1L, QuestionType.SINGLE_CHOICE, Difficulty.EASY,
                        "Question", null, null, null, List.of(), List.of(), "{}")));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(new ActivityQuestionSnapshot(
                        2, 1L, QuestionType.ORDERING, Difficulty.EASY,
                        "Question", null, null, null, List.of(), List.of(), "{}",
                        orderingSnapshot(Difficulty.EASY).ordering())));
        assertThrows(QuestionEngineException.class,
                () -> assembler.requireXpEligible(new ActivityQuestionSnapshot(
                        3, 1L, QuestionType.ORDERING, Difficulty.EASY,
                        "Question", null, null, null, List.of(), List.of(), "{}")));
    }

    @Test
    void readsLegacyV2AndOrderingV3WithoutChangingTheirCompatibilityBoundary() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ActivityQuestionSnapshotAssembler reader = new ActivityQuestionSnapshotAssembler(
                mock(QuestionOptionRepository.class),
                mock(QuestionAnswerRepository.class),
                mock(QuestionSpecMapper.class), mapper,
                mock(OrderingRuntimeService.class));
        ActivitySessionQuestion legacyItem = item(2, mapper.writeValueAsString(
                snapshot(2, Difficulty.MEDIUM).withoutPayload()));
        ActivitySessionQuestion orderingItem = item(3, mapper.writeValueAsString(
                orderingSnapshot(Difficulty.HARD).withoutPayload()));

        ActivityQuestionSnapshot legacy = reader.read(legacyItem);
        ActivityQuestionSnapshot ordering = reader.read(orderingItem);

        assertEquals(QuestionType.SINGLE_CHOICE, legacy.type());
        assertNull(legacy.ordering());
        assertEquals(QuestionType.ORDERING, ordering.type());
        assertNotNull(ordering.ordering());
        assertDoesNotThrow(() -> reader.requireXpEligible(legacy));
        assertDoesNotThrow(() -> reader.requireXpEligible(ordering));
    }

    private static ActivityQuestionSnapshot snapshot(int schemaVersion, Difficulty difficulty) {
        return new ActivityQuestionSnapshot(
                schemaVersion, 1L, QuestionType.SINGLE_CHOICE, difficulty,
                "Question", null, null, null, List.of(), List.of(), "{}");
    }

    private static ActivityQuestionSnapshot orderingSnapshot(Difficulty difficulty) {
        OrderingRuntimeSnapshot ordering = new OrderingRuntimeSnapshot(1, 1, OrderingSubtype.WORD,
                List.of(
                        new OrderingRuntimeSnapshot.Item("a", "one"),
                        new OrderingRuntimeSnapshot.Item("b", "two"),
                        new OrderingRuntimeSnapshot.Item("c", "three")),
                List.of(List.of("a", "b", "c")), List.of("b", "a", "c"));
        return new ActivityQuestionSnapshot(3, 1L, QuestionType.ORDERING, difficulty,
                "Question", null, null, null, List.of(), List.of(), "{}", ordering);
    }

    private static ActivitySessionQuestion item(int schemaVersion, String payload) {
        ActivitySessionQuestion item = new ActivitySessionQuestion();
        item.setSnapshotSchemaVersion(schemaVersion);
        item.setSnapshotContentRevision(1L);
        item.setSnapshotPayload(payload);
        return item;
    }
}
