package e_learning.server.activitysession.ordering;

import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.types.ordering.OrderingSpec;
import e_learning.server.question.engine.types.ordering.OrderingSubtype;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderingRuntimeServiceTest {
    private final OrderingRuntimeService service = new OrderingRuntimeService(new QuestionEngine());
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void freezesANonAcceptedPresentationAndProjectsNoAnswerKey() {
        OrderingRuntimeSnapshot snapshot = service.snapshot(spec());
        var publicView = service.publicView(snapshot);

        assertEquals(OrderingSubtype.PHRASE, publicView.subtype());
        assertEquals(3, publicView.items().size());
        List<String> visible = publicView.items().stream().map(item -> item.content()).toList();
        assertFalse(visible.equals(List.of("Today", "we learn", "English")));
        assertEquals(snapshot.presentationOrder(),
                publicView.items().stream().map(item -> item.key()).toList());
    }

    @Test
    void gradesTypedOrderAndRejectsMalformedPermutation() throws Exception {
        OrderingRuntimeSnapshot ordering = service.snapshot(spec());
        ActivityQuestionSnapshot snapshot = activitySnapshot(ordering);

        assertTrue(service.grade(snapshot,
                objectMapper.readTree("{\"order\":[\"a\",\"b\",\"c\"]}")));
        assertFalse(service.grade(snapshot,
                objectMapper.readTree("{\"order\":[\"b\",\"a\",\"c\"]}")));
        AppException error = assertThrows(AppException.class, () -> service.grade(snapshot,
                objectMapper.readTree("{\"order\":[\"a\",\"a\",\"c\"]}")));
        assertEquals(ErrorCode.ORDERING_INVALID_PERMUTATION, error.getErrorCode());
    }

    @Test
    void revealsOnlyOneTypedSampleOrder() {
        ActivityQuestionSnapshot snapshot = activitySnapshot(service.snapshot(spec()));
        assertEquals(List.of("a", "b", "c"), service.reveal(snapshot).items().stream()
                .map(item -> item.key()).toList());
    }

    private OrderingSpec spec() {
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
                "Order the phrases", Difficulty.EASY, "Explanation", "Hint", List.of());
        return new OrderingSpec(common, 1, OrderingSubtype.PHRASE,
                List.of(
                        new OrderingSpec.Item("a", "Today"),
                        new OrderingSpec.Item("b", "we learn"),
                        new OrderingSpec.Item("c", "English")),
                List.of(List.of("a", "b", "c")));
    }

    private ActivityQuestionSnapshot activitySnapshot(OrderingRuntimeSnapshot ordering) {
        return new ActivityQuestionSnapshot(3, 1L, QuestionType.ORDERING, Difficulty.EASY,
                "Order the phrases", "Explanation", "Hint", null,
                List.of(), List.of(), "{}", ordering);
    }
}
