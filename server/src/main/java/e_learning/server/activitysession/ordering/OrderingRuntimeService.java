package e_learning.server.activitysession.ordering;

import e_learning.server.activitysession.dto.response.ordering.OrderingAnswerRevealResponse;
import e_learning.server.activitysession.dto.response.ordering.OrderingQuestionResponse;
import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.types.ordering.OrderingSpec;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/** Owns Ordering snapshot shuffle, Student projection and answer adaptation. */
@Service
@RequiredArgsConstructor
public class OrderingRuntimeService {
    private static final int SHUFFLE_ATTEMPTS = 24;

    private final QuestionEngine questionEngine;

    public OrderingRuntimeSnapshot snapshot(OrderingSpec spec) {
        List<OrderingRuntimeSnapshot.Item> items = spec.items().stream()
                .map(item -> new OrderingRuntimeSnapshot.Item(item.key(), item.content()))
                .toList();
        List<String> presentationOrder = choosePresentationOrder(items, spec.acceptedOrders());
        return new OrderingRuntimeSnapshot(
                OrderingRuntimeSnapshot.CANONICALIZATION_VERSION,
                OrderingRuntimeSnapshot.GRADING_VERSION,
                spec.subtype(), items, spec.acceptedOrders(), presentationOrder);
    }

    public OrderingQuestionResponse publicView(OrderingRuntimeSnapshot snapshot) {
        Map<String, OrderingRuntimeSnapshot.Item> byKey = itemsByKey(snapshot);
        List<OrderingQuestionResponse.Item> items = snapshot.presentationOrder().stream()
                .map(byKey::get)
                .map(item -> new OrderingQuestionResponse.Item(item.key(), item.content()))
                .toList();
        return new OrderingQuestionResponse(snapshot.subtype(), items);
    }

    public boolean grade(ActivityQuestionSnapshot snapshot, JsonNode answer) {
        OrderingRuntimeSnapshot ordering = requireSnapshot(snapshot);
        List<String> order = parseOrder(answer);
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
                snapshot.content(), snapshot.difficulty(), snapshot.explanation(), snapshot.hint(), List.of());
        OrderingSpec spec = new OrderingSpec(common, OrderingSpec.SCHEMA_VERSION, ordering.subtype(),
                ordering.items().stream()
                        .map(item -> new OrderingSpec.Item(item.key(), item.content()))
                        .toList(),
                ordering.acceptedOrders());
        var parsed = questionEngine.parseAndValidate(spec, new RawAnswer(order));
        if (!parsed.valid()) throw new AppException(ErrorCode.ORDERING_INVALID_PERMUTATION);
        return questionEngine.grade(spec, parsed.answer().orElseThrow()).scoreFraction()
                .compareTo(BigDecimal.ONE) == 0;
    }

    public OrderingAnswerRevealResponse reveal(ActivityQuestionSnapshot snapshot) {
        OrderingRuntimeSnapshot ordering = requireSnapshot(snapshot);
        Map<String, OrderingRuntimeSnapshot.Item> byKey = itemsByKey(ordering);
        List<OrderingQuestionResponse.Item> items = ordering.acceptedOrders().getFirst().stream()
                .map(byKey::get)
                .map(item -> new OrderingQuestionResponse.Item(item.key(), item.content()))
                .toList();
        return new OrderingAnswerRevealResponse(items);
    }

    private OrderingRuntimeSnapshot requireSnapshot(ActivityQuestionSnapshot snapshot) {
        if (snapshot == null
                || snapshot.ordering() == null
                || snapshot.ordering().canonicalizationVersion()
                        != OrderingRuntimeSnapshot.CANONICALIZATION_VERSION
                || snapshot.ordering().gradingVersion()
                        != OrderingRuntimeSnapshot.GRADING_VERSION) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
        }
        return snapshot.ordering();
    }

    private List<String> parseOrder(JsonNode answer) {
        JsonNode order = answer == null || !answer.isObject() ? null : answer.get("order");
        if (order == null || !order.isArray()) {
            throw new AppException(ErrorCode.ORDERING_INVALID_PERMUTATION);
        }
        List<String> keys = new ArrayList<>();
        order.forEach(value -> {
            if (!value.isTextual()) throw new AppException(ErrorCode.ORDERING_INVALID_PERMUTATION);
            keys.add(value.asText());
        });
        return keys;
    }

    private List<String> choosePresentationOrder(
            List<OrderingRuntimeSnapshot.Item> items,
            List<List<String>> acceptedOrders) {
        List<String> keys = items.stream().map(OrderingRuntimeSnapshot.Item::key).toList();
        Map<String, String> contentByKey = new HashMap<>();
        items.forEach(item -> contentByKey.put(item.key(), item.content()));
        HashSet<List<String>> acceptedVisible = new HashSet<>();
        acceptedOrders.forEach(order -> acceptedVisible.add(visibleOrder(order, contentByKey)));

        for (int attempt = 0; attempt < SHUFFLE_ATTEMPTS; attempt++) {
            List<String> candidate = new ArrayList<>(keys);
            Collections.shuffle(candidate, ThreadLocalRandom.current());
            if (!acceptedVisible.contains(visibleOrder(candidate, contentByKey))) return candidate;
        }

        List<String> fallback = firstNonAcceptedPermutation(
                new ArrayList<>(), new ArrayList<>(keys), acceptedVisible, contentByKey);
        if (fallback == null) throw new AppException(ErrorCode.ORDERING_NO_VALID_SHUFFLE);
        return fallback;
    }

    private List<String> firstNonAcceptedPermutation(
            List<String> prefix,
            List<String> remaining,
            HashSet<List<String>> acceptedVisible,
            Map<String, String> contentByKey) {
        if (remaining.isEmpty()) {
            return acceptedVisible.contains(visibleOrder(prefix, contentByKey)) ? null : List.copyOf(prefix);
        }
        for (int index = 0; index < remaining.size(); index++) {
            String key = remaining.remove(index);
            prefix.add(key);
            List<String> result = firstNonAcceptedPermutation(prefix, remaining, acceptedVisible, contentByKey);
            prefix.removeLast();
            remaining.add(index, key);
            if (result != null) return result;
        }
        return null;
    }

    private List<String> visibleOrder(List<String> order, Map<String, String> contentByKey) {
        return order.stream().map(contentByKey::get).toList();
    }

    private Map<String, OrderingRuntimeSnapshot.Item> itemsByKey(OrderingRuntimeSnapshot snapshot) {
        Map<String, OrderingRuntimeSnapshot.Item> result = new LinkedHashMap<>();
        snapshot.items().forEach(item -> result.put(item.key(), item));
        return result;
    }
}
