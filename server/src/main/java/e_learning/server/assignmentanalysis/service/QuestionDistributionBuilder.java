package e_learning.server.assignmentanalysis.service;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assignmentanalysis.dto.response.AnswerDistributionItem;
import e_learning.server.assignmentanalysis.dto.response.BlankDistribution;
import e_learning.server.assignmentanalysis.dto.response.QuestionAnswerDistribution;
import e_learning.server.question.enums.QuestionType;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

/**
 * Builds type-specific answer distributions from question snapshots + answer payloads.
 *
 * Payload conventions:
 * SINGLE_CHOICE: selectedKey | MULTIPLE_CHOICE: selectedKeys[] |
 * TRUE_FALSE: selected/value | TYPE/FILL: text/value |
 * CLOZE: blanks map | MATCHING: pairs map
 */
public final class QuestionDistributionBuilder {

    private QuestionDistributionBuilder() {}

    public static QuestionAnswerDistribution build(
            String questionType,
            Map<String, Object> snapshot,
            List<AssessmentAttemptQuestion> attemptsAtPosition
    ) {
        int sample = attemptsAtPosition.size();
        QuestionType type = parseType(questionType);
        if (type == null) {
            return QuestionAnswerDistribution.empty("UNKNOWN", sample);
        }
        return switch (type) {
            case SINGLE_CHOICE, TRUE_FALSE -> buildSingleSelect(type, snapshot, attemptsAtPosition);
            case MULTIPLE_CHOICE -> buildMultiSelect(snapshot, attemptsAtPosition);
            case TYPE_ANSWER, FILL_IN_BLANK -> buildText(snapshot, attemptsAtPosition);
            case CLOZE -> buildCloze(snapshot, attemptsAtPosition);
            case MATCHING -> buildMatching(snapshot, attemptsAtPosition);
        };
    }

    private static QuestionAnswerDistribution buildSingleSelect(
            QuestionType type,
            Map<String, Object> snapshot,
            List<AssessmentAttemptQuestion> attempts
    ) {
        List<OptionDef> options = extractOptions(type, snapshot);
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (OptionDef o : options) counts.put(o.key(), 0);
        int unanswered = 0;
        for (AssessmentAttemptQuestion q : attempts) {
            String selected = extractSingleKey(type, q.getAnswerPayload());
            if (selected == null || selected.isBlank()) {
                unanswered++;
                continue;
            }
            String norm = selected.trim().toUpperCase(Locale.ROOT);
            counts.merge(norm, 1, Integer::sum);
        }
        Set<String> correct = extractCorrectKeys(type, snapshot);
        List<AnswerDistributionItem> items = new ArrayList<>();
        for (OptionDef o : options) {
            items.add(new AnswerDistributionItem(
                    o.key(), o.label(), counts.getOrDefault(o.key(), 0), correct.contains(o.key())));
        }
        for (Map.Entry<String, Integer> e : counts.entrySet()) {
            if (options.stream().noneMatch(o -> o.key().equals(e.getKey())) && e.getValue() > 0) {
                items.add(new AnswerDistributionItem(e.getKey(), e.getKey(), e.getValue(), false));
            }
        }
        return QuestionAnswerDistribution.options(items, unanswered, attempts.size());
    }

    private static QuestionAnswerDistribution buildMultiSelect(
            Map<String, Object> snapshot,
            List<AssessmentAttemptQuestion> attempts
    ) {
        List<OptionDef> options = extractOptions(QuestionType.MULTIPLE_CHOICE, snapshot);
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (OptionDef o : options) counts.put(o.key(), 0);
        int unanswered = 0;
        for (AssessmentAttemptQuestion q : attempts) {
            List<String> keys = extractMultiKeys(q.getAnswerPayload());
            if (keys.isEmpty()) {
                unanswered++;
                continue;
            }
            for (String k : keys) counts.merge(k, 1, Integer::sum);
        }
        Set<String> correct = extractCorrectKeys(QuestionType.MULTIPLE_CHOICE, snapshot);
        List<AnswerDistributionItem> items = new ArrayList<>();
        for (OptionDef o : options) {
            items.add(new AnswerDistributionItem(
                    o.key(), o.label(), counts.getOrDefault(o.key(), 0), correct.contains(o.key())));
        }
        return QuestionAnswerDistribution.options(items, unanswered, attempts.size());
    }

    private static QuestionAnswerDistribution buildText(
            Map<String, Object> snapshot,
            List<AssessmentAttemptQuestion> attempts
    ) {
        Map<String, Integer> counts = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        int unanswered = 0;
        for (AssessmentAttemptQuestion q : attempts) {
            String text = extractText(q.getAnswerPayload());
            if (text == null || text.isBlank()) {
                unanswered++;
                continue;
            }
            counts.merge(text.trim(), 1, Integer::sum);
        }
        Set<String> accepted = extractAcceptedAnswers(snapshot);
        List<AnswerDistributionItem> items = counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(12)
                .map(e -> new AnswerDistributionItem(
                        e.getKey(), e.getKey(), e.getValue(),
                        accepted.stream().anyMatch(a -> a.equalsIgnoreCase(e.getKey()))))
                .toList();
        return QuestionAnswerDistribution.text(items, unanswered, attempts.size());
    }

    private static QuestionAnswerDistribution buildCloze(
            Map<String, Object> snapshot,
            List<AssessmentAttemptQuestion> attempts
    ) {
        List<BlankDef> blanks = extractClozeBlanks(snapshot);
        if (blanks.isEmpty()) {
            return QuestionAnswerDistribution.cloze(List.of(), 0, attempts.size());
        }
        Map<String, Map<String, Integer>> perBlank = new LinkedHashMap<>();
        Map<String, Integer> blankEmpty = new LinkedHashMap<>();
        for (BlankDef b : blanks) {
            perBlank.put(b.key(), new TreeMap<>(String.CASE_INSENSITIVE_ORDER));
            blankEmpty.put(b.key(), 0);
        }
        int fullyUnanswered = 0;
        for (AssessmentAttemptQuestion q : attempts) {
            Map<String, String> values = extractClozeValues(q.getAnswerPayload());
            if (values.isEmpty()) {
                fullyUnanswered++;
                for (BlankDef b : blanks) blankEmpty.merge(b.key(), 1, Integer::sum);
                continue;
            }
            for (BlankDef b : blanks) {
                String v = values.get(b.key());
                if (v == null || v.isBlank()) blankEmpty.merge(b.key(), 1, Integer::sum);
                else perBlank.get(b.key()).merge(v.trim(), 1, Integer::sum);
            }
        }
        List<BlankDistribution> rows = new ArrayList<>();
        for (BlankDef b : blanks) {
            Map<String, Integer> c = perBlank.get(b.key());
            List<AnswerDistributionItem> answers = c.entrySet().stream()
                    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                    .limit(8)
                    .map(e -> new AnswerDistributionItem(
                            e.getKey(), e.getKey(), e.getValue(),
                            b.accepted().stream().anyMatch(a -> a.equalsIgnoreCase(e.getKey()))))
                    .toList();
            rows.add(new BlankDistribution(b.key(), b.label(), answers, blankEmpty.getOrDefault(b.key(), 0)));
        }
        return QuestionAnswerDistribution.cloze(rows, fullyUnanswered, attempts.size());
    }

    private static QuestionAnswerDistribution buildMatching(
            Map<String, Object> snapshot,
            List<AssessmentAttemptQuestion> attempts
    ) {
        List<BlankDef> lefts = extractMatchingLeft(snapshot);
        Map<String, Map<String, Integer>> perLeft = new LinkedHashMap<>();
        Map<String, Integer> empty = new LinkedHashMap<>();
        for (BlankDef l : lefts) {
            perLeft.put(l.key(), new TreeMap<>(String.CASE_INSENSITIVE_ORDER));
            empty.put(l.key(), 0);
        }
        int fullyUnanswered = 0;
        for (AssessmentAttemptQuestion q : attempts) {
            Map<String, String> pairs = extractMatchingPairs(q.getAnswerPayload());
            if (pairs.isEmpty()) {
                fullyUnanswered++;
                for (BlankDef l : lefts) empty.merge(l.key(), 1, Integer::sum);
                continue;
            }
            for (BlankDef l : lefts) {
                String right = pairs.get(l.key());
                if (right == null || right.isBlank()) empty.merge(l.key(), 1, Integer::sum);
                else perLeft.get(l.key()).merge(right.trim(), 1, Integer::sum);
            }
        }
        List<BlankDistribution> rows = new ArrayList<>();
        for (BlankDef l : lefts) {
            Map<String, Integer> c = perLeft.getOrDefault(l.key(), Map.of());
            List<AnswerDistributionItem> answers = c.entrySet().stream()
                    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                    .limit(8)
                    .map(e -> new AnswerDistributionItem(
                            e.getKey(), e.getKey(), e.getValue(),
                            l.accepted().stream().anyMatch(a -> a.equalsIgnoreCase(e.getKey()))))
                    .toList();
            rows.add(new BlankDistribution(l.key(), l.label(), answers, empty.getOrDefault(l.key(), 0)));
        }
        return QuestionAnswerDistribution.matching(rows, fullyUnanswered, attempts.size());
    }

    private static String extractSingleKey(QuestionType type, Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) return null;
        if (type == QuestionType.TRUE_FALSE) {
            Object v = first(payload, "selected", "value", "answer");
            if (v instanceof Boolean b) return b ? "TRUE" : "FALSE";
            if (v != null) return String.valueOf(v).trim().toUpperCase(Locale.ROOT);
            return null;
        }
        Object v = first(payload, "selectedKey", "value", "answer");
        return v == null ? null : String.valueOf(v).trim().toUpperCase(Locale.ROOT);
    }

    private static List<String> extractMultiKeys(Map<String, Object> payload) {
        if (payload == null) return List.of();
        Object v = first(payload, "selectedKeys", "value", "answer");
        if (!(v instanceof List<?> list)) return List.of();
        List<String> out = new ArrayList<>();
        for (Object item : list) {
            if (item != null && !String.valueOf(item).isBlank()) {
                out.add(String.valueOf(item).trim().toUpperCase(Locale.ROOT));
            }
        }
        return out;
    }

    private static String extractText(Map<String, Object> payload) {
        if (payload == null) return null;
        Object v = first(payload, "text", "value", "answer");
        return v == null ? null : String.valueOf(v);
    }

    private static Map<String, String> extractClozeValues(Map<String, Object> payload) {
        if (payload == null) return Map.of();
        Object raw = first(payload, "blanks", "value", "answers");
        if (!(raw instanceof Map<?, ?> map)) return Map.of();
        Map<String, String> out = new LinkedHashMap<>();
        for (Map.Entry<?, ?> e : map.entrySet()) {
            if (e.getKey() != null && e.getValue() != null) {
                out.put(String.valueOf(e.getKey()), String.valueOf(e.getValue()));
            }
        }
        return out;
    }

    private static Map<String, String> extractMatchingPairs(Map<String, Object> payload) {
        if (payload == null) return Map.of();
        Object raw = first(payload, "pairs", "value", "answers", "matching");
        if (!(raw instanceof Map<?, ?> map)) return Map.of();
        Map<String, String> out = new LinkedHashMap<>();
        for (Map.Entry<?, ?> e : map.entrySet()) {
            if (e.getKey() != null && e.getValue() != null) {
                out.put(String.valueOf(e.getKey()), String.valueOf(e.getValue()));
            }
        }
        return out;
    }

    private static Object first(Map<String, Object> map, String... keys) {
        for (String k : keys) {
            if (map.containsKey(k) && map.get(k) != null) return map.get(k);
        }
        return null;
    }

    private record OptionDef(String key, String label) {}

    private record BlankDef(String key, String label, List<String> accepted) {}

    private static List<OptionDef> extractOptions(QuestionType type, Map<String, Object> snapshot) {
        if (type == QuestionType.TRUE_FALSE) {
            return List.of(new OptionDef("TRUE", "True"), new OptionDef("FALSE", "False"));
        }
        List<?> options = asList(deep(snapshot, "options", "grading.options", "content.options", "studentSpec.options"));
        List<OptionDef> out = new ArrayList<>();
        for (Object o : options) {
            if (o instanceof Map<?, ?> m) {
                String key = str(m.get("key"));
                if (key == null) key = str(m.get("optionKey"));
                if (key == null) continue;
                String label = str(m.get("content"));
                if (label == null) label = str(m.get("label"));
                if (label == null) label = key;
                out.add(new OptionDef(key.trim().toUpperCase(Locale.ROOT), label));
            }
        }
        return out;
    }

    private static Set<String> extractCorrectKeys(QuestionType type, Map<String, Object> snapshot) {
        if (type == QuestionType.TRUE_FALSE) {
            Object expected = deep(snapshot, "expected", "grading.expected", "answers", "grading.answers");
            if (expected instanceof Boolean b) return Set.of(b ? "TRUE" : "FALSE");
            if (expected instanceof List<?> list && !list.isEmpty()) {
                return Set.of(String.valueOf(list.get(0)).trim().toUpperCase(Locale.ROOT));
            }
            if (expected != null) return Set.of(String.valueOf(expected).trim().toUpperCase(Locale.ROOT));
            List<?> options = asList(deep(snapshot, "options", "grading.options"));
            for (Object o : options) {
                if (o instanceof Map<?, ?> m && bool(m.get("correct"))) {
                    String key = str(m.get("key"));
                    if (key != null) return Set.of(key.trim().toUpperCase(Locale.ROOT));
                }
            }
            return Set.of();
        }
        if (type == QuestionType.MULTIPLE_CHOICE) {
            Object keys = deep(snapshot, "correctKeys", "grading.correctKeys");
            if (keys instanceof List<?> list) {
                return list.stream().filter(Objects::nonNull)
                        .map(v -> String.valueOf(v).trim().toUpperCase(Locale.ROOT))
                        .collect(java.util.stream.Collectors.toSet());
            }
        }
        Object ck = deep(snapshot, "correctKey", "grading.correctKey");
        if (ck != null) return Set.of(String.valueOf(ck).trim().toUpperCase(Locale.ROOT));
        List<?> options = asList(deep(snapshot, "options", "grading.options"));
        Set<String> set = new java.util.HashSet<>();
        for (Object o : options) {
            if (o instanceof Map<?, ?> m && bool(m.get("correct"))) {
                String key = str(m.get("key"));
                if (key == null) key = str(m.get("optionKey"));
                if (key != null) set.add(key.trim().toUpperCase(Locale.ROOT));
            }
        }
        return set;
    }

    private static Set<String> extractAcceptedAnswers(Map<String, Object> snapshot) {
        Object answers = deep(snapshot, "answers", "grading.answers", "acceptedAnswers");
        if (answers instanceof List<?> list) {
            return list.stream().filter(Objects::nonNull).map(v -> String.valueOf(v).trim())
                    .filter(s -> !s.isEmpty()).collect(java.util.stream.Collectors.toSet());
        }
        return Set.of();
    }

    private static List<BlankDef> extractClozeBlanks(Map<String, Object> snapshot) {
        List<?> blanks = asList(deep(snapshot, "blanks", "content.blanks", "grading.blanks"));
        List<BlankDef> out = new ArrayList<>();
        int i = 1;
        for (Object b : blanks) {
            if (b instanceof Map<?, ?> m) {
                String key = str(m.get("key"));
                if (key == null) continue;
                List<String> accepted = new ArrayList<>();
                Object acc = m.get("acceptedAnswers");
                if (acc instanceof List<?> list) {
                    for (Object a : list) if (a != null) accepted.add(String.valueOf(a).trim());
                }
                String label = str(m.get("label"));
                if (label == null) label = "(" + i + ")";
                out.add(new BlankDef(key, label, accepted));
                i++;
            }
        }
        return out;
    }

    private static List<BlankDef> extractMatchingLeft(Map<String, Object> snapshot) {
        List<?> left = asList(deep(snapshot, "leftItems", "content.left", "pairs", "grading.pairs"));
        List<BlankDef> out = new ArrayList<>();
        for (Object item : left) {
            if (item instanceof Map<?, ?> m) {
                String key = str(m.get("key"));
                if (key == null) key = str(m.get("leftKey"));
                if (key == null) continue;
                String label = str(m.get("content"));
                if (label == null) label = str(m.get("label"));
                if (label == null) label = key;
                List<String> accepted = new ArrayList<>();
                Object right = m.get("correctRightKey");
                if (right != null) accepted.add(String.valueOf(right).trim());
                Object match = m.get("matchKey");
                if (match != null) accepted.add(String.valueOf(match).trim());
                out.add(new BlankDef(key, label, accepted));
            }
        }
        if (out.isEmpty()) {
            Object answers = deep(snapshot, "answers", "grading.answers");
            if (answers instanceof Map<?, ?> map) {
                for (Map.Entry<?, ?> e : map.entrySet()) {
                    if (e.getKey() != null) {
                        out.add(new BlankDef(
                                String.valueOf(e.getKey()),
                                String.valueOf(e.getKey()),
                                e.getValue() == null ? List.of() : List.of(String.valueOf(e.getValue()))));
                    }
                }
            }
        }
        return out;
    }

    private static QuestionType parseType(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return QuestionType.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (Exception e) {
            return null;
        }
    }

    private static Object deep(Map<String, Object> root, String... paths) {
        if (root == null) return null;
        for (String path : paths) {
            Object cur = root;
            boolean ok = true;
            for (String part : path.split("\\.")) {
                if (!(cur instanceof Map<?, ?> m) || !m.containsKey(part)) {
                    ok = false;
                    break;
                }
                cur = m.get(part);
            }
            if (ok && cur != null) return cur;
        }
        return null;
    }

    private static List<?> asList(Object o) {
        return o instanceof List<?> list ? list : List.of();
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static boolean bool(Object o) {
        if (o instanceof Boolean b) return b;
        if (o == null) return false;
        return Boolean.parseBoolean(String.valueOf(o));
    }
}
