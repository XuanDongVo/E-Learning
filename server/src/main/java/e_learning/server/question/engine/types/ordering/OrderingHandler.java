package e_learning.server.question.engine.types.ordering;

import e_learning.server.question.engine.core.AbstractQuestionTypeHandler;
import e_learning.server.question.engine.model.AnswerParseResult;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.model.ValidatedAnswer;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.result.GradeResult;
import e_learning.server.question.enums.QuestionType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class OrderingHandler extends AbstractQuestionTypeHandler {
    private static final int MIN_ITEMS = 3;
    private static final int MAX_ITEMS = 8;

    @Override
    public QuestionType type() {
        return QuestionType.ORDERING;
    }

    @Override
    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        DefinitionValidation common = common(spec);
        if (common != null) return common;

        OrderingSpec ordering = (OrderingSpec) spec;
        if (ordering.schemaVersion() != OrderingSpec.SCHEMA_VERSION) {
            return DefinitionValidation.invalid("ordering.schema_version.unsupported");
        }
        if (ordering.subtype() == null) {
            return DefinitionValidation.incomplete("ordering.subtype.required");
        }
        if (ordering.items().size() < MIN_ITEMS || ordering.items().size() > MAX_ITEMS) {
            return DefinitionValidation.incomplete("ordering.items.size");
        }

        Set<String> keys = new LinkedHashSet<>();
        for (OrderingSpec.Item item : ordering.items()) {
            if (item.key().isBlank()) return DefinitionValidation.incomplete("ordering.items.key.required");
            if (!keys.add(item.key())) return DefinitionValidation.invalid("ordering.items.key.duplicate");
            if (item.content().isBlank()) return DefinitionValidation.incomplete("ordering.items.content.required");
            if (item.content().length() > maxContentLength(ordering.subtype())) {
                return DefinitionValidation.invalid("ordering.items.content.too_long");
            }
        }

        if (ordering.acceptedOrders().isEmpty()) {
            return DefinitionValidation.incomplete("ordering.accepted_orders.required");
        }
        Set<List<String>> visibleAcceptedOrders = new HashSet<>();
        for (List<String> acceptedOrder : ordering.acceptedOrders()) {
            if (!isPermutation(acceptedOrder, keys)) {
                return DefinitionValidation.invalid("ordering.accepted_orders.permutation");
            }
            visibleAcceptedOrders.add(contentSequence(ordering, acceptedOrder));
        }
        if (visibleAcceptedOrders.size() >= distinctVisiblePermutationCount(ordering.items())) {
            return DefinitionValidation.invalid("ordering.shuffle.no_valid_permutation");
        }
        return DefinitionValidation.ready();
    }

    @Override
    public AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer rawAnswer) {
        requireType(spec);
        if (rawAnswer == null || rawAnswer.value() == null) return AnswerParseResult.unansweredResult();
        if (!(rawAnswer.value() instanceof List<?> values)) {
            return AnswerParseResult.invalid("answer.ordering.invalid");
        }

        List<String> order = new ArrayList<>(values.size());
        for (Object value : values) {
            if (!(value instanceof String key) || key.trim().isEmpty()) {
                return AnswerParseResult.invalid("answer.ordering.invalid");
            }
            order.add(key.trim());
        }
        OrderingSpec ordering = (OrderingSpec) spec;
        Set<String> expectedKeys = ordering.items().stream()
                .map(OrderingSpec.Item::key)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        if (!isPermutation(order, expectedKeys)) {
            return AnswerParseResult.invalid("answer.ordering.permutation");
        }
        return AnswerParseResult.valid(new ValidatedAnswer(type(), new OrderingAnswer(order)));
    }

    @Override
    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        requireType(spec);
        OrderingSpec ordering = (OrderingSpec) spec;
        OrderingAnswer submitted = (OrderingAnswer) answer.value();
        List<String> submittedContent = contentSequence(ordering, submitted.order());
        boolean correct = ordering.acceptedOrders().stream()
                .map(order -> contentSequence(ordering, order))
                .anyMatch(submittedContent::equals);
        return gradeOne("order", true, correct, String.join("\u001F", submitted.order()));
    }

    private boolean isPermutation(List<String> order, Set<String> keys) {
        return order.size() == keys.size()
                && new HashSet<>(order).size() == order.size()
                && keys.containsAll(order);
    }

    private List<String> contentSequence(OrderingSpec ordering, List<String> order) {
        Map<String, String> contentByKey = ordering.items().stream()
                .collect(java.util.stream.Collectors.toUnmodifiableMap(
                        OrderingSpec.Item::key,
                        OrderingSpec.Item::content));
        return order.stream().map(contentByKey::get).toList();
    }

    private long distinctVisiblePermutationCount(List<OrderingSpec.Item> items) {
        long count = factorial(items.size());
        Map<String, Integer> frequencies = new HashMap<>();
        items.forEach(item -> frequencies.merge(item.content(), 1, Integer::sum));
        for (Integer frequency : frequencies.values()) count /= factorial(frequency);
        return count;
    }

    private long factorial(int value) {
        long result = 1;
        for (int number = 2; number <= value; number++) result *= number;
        return result;
    }

    private int maxContentLength(OrderingSubtype subtype) {
        return switch (subtype) {
            case WORD -> 60;
            case PHRASE -> 180;
            case SENTENCE -> 400;
        };
    }
}
