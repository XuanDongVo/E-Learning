package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptPartResult;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AttemptPartStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptPartResultRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.model.AnswerParseResult;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.result.GradeResult;
import e_learning.server.question.engine.result.PartGrade;
import e_learning.server.question.engine.result.PartStatus;
import e_learning.server.question.engine.types.choice.MultipleChoiceSpec;
import e_learning.server.question.engine.types.choice.SingleChoiceSpec;
import e_learning.server.question.engine.types.compound.ClozeSpec;
import e_learning.server.question.engine.types.compound.MatchingSpec;
import e_learning.server.question.engine.types.text.FillInBlankSpec;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.engine.types.text.TypeAnswerSpec;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Grades an in-progress {@link AssessmentAttempt} from saved answer payloads and immutable snapshots.
 * Writes {@link AssessmentAttemptPartResult} rows and updates attempt aggregates.
 */
@Service
@RequiredArgsConstructor
public class AssessmentAttemptGradingService {
    private static final String MAIN_PART = "main";

    private final AssessmentAttemptQuestionRepository questionRepository;
    private final AssessmentAttemptPartResultRepository partResultRepository;
    private final QuestionEngine questionEngine;

    public void gradeAndPersist(AssessmentAttempt attempt) {
        List<AssessmentAttemptQuestion> questions =
                questionRepository.findAllByAttemptIdOrderByPositionAsc(attempt.getId());

        partResultRepository.deleteByAttemptId(attempt.getId());

        BigDecimal totalEarned = BigDecimal.ZERO;
        List<AssessmentAttemptPartResult> results = new ArrayList<>();

        for (AssessmentAttemptQuestion question : questions) {
            if (question.isExample()) {
                continue;
            }

            BigDecimal possible = nullToZero(question.getPossiblePoints());
            Map<String, Object> payload = question.getAnswerPayload();

            if (isBlankPayload(payload)) {
                results.add(partResult(question, MAIN_PART, AttemptPartStatus.UNANSWERED,
                        BigDecimal.ZERO, possible));
                continue;
            }

            try {
                QuestionSpec spec = rebuildSpec(question.getQuestionSnapshot());
                RawAnswer raw = toRawAnswer(spec.type(), payload);
                AnswerParseResult parsed = questionEngine.parseAndValidate(spec, raw);

                if (parsed.isUnanswered()) {
                    results.add(partResult(question, MAIN_PART, AttemptPartStatus.UNANSWERED,
                            BigDecimal.ZERO, possible));
                    continue;
                }
                if (parsed.invalid() || parsed.answer().isEmpty()) {
                    results.add(partResult(question, MAIN_PART, AttemptPartStatus.INCORRECT,
                            BigDecimal.ZERO, possible));
                    continue;
                }

                GradeResult grade = questionEngine.grade(spec, parsed.answer().get());
                if (grade.parts().isEmpty()) {
                    BigDecimal earned = possible.multiply(grade.scoreFraction()).setScale(2, RoundingMode.HALF_UP);
                    AttemptPartStatus status = mapFraction(grade.scoreFraction());
                    results.add(partResult(question, MAIN_PART, status, earned, possible));
                    totalEarned = totalEarned.add(earned);
                } else {
                    for (PartGrade part : grade.parts()) {
                        BigDecimal partPossible = possible.multiply(part.possibleWeight())
                                .setScale(2, RoundingMode.HALF_UP);
                        BigDecimal partEarned = possible.multiply(part.earnedWeight())
                                .setScale(2, RoundingMode.HALF_UP);
                        results.add(partResult(question, part.partKey(), mapPartStatus(part.status()),
                                partEarned, partPossible));
                        totalEarned = totalEarned.add(partEarned);
                    }
                }
            } catch (RuntimeException ex) {
                results.add(partResult(question, MAIN_PART, AttemptPartStatus.INCORRECT,
                        BigDecimal.ZERO, possible));
            }
        }

        partResultRepository.saveAllAndFlush(results);

        BigDecimal totalPossible = nullToZero(attempt.getTotalPossiblePoints());
        attempt.setTotalEarnedPoints(totalEarned.setScale(2, RoundingMode.HALF_UP));
        if (totalPossible.signum() > 0) {
            attempt.setPercentageScore(
                    totalEarned.divide(totalPossible, 4, RoundingMode.HALF_UP));
        } else {
            attempt.setPercentageScore(BigDecimal.ZERO);
        }
    }

    private AssessmentAttemptPartResult partResult(
            AssessmentAttemptQuestion question,
            String partKey,
            AttemptPartStatus status,
            BigDecimal earned,
            BigDecimal possible
    ) {
        AssessmentAttemptPartResult row = new AssessmentAttemptPartResult();
        row.setAttemptQuestion(question);
        row.setPartKey(partKey);
        row.setStatus(status);
        row.setEarnedPoints(nullToZero(earned));
        row.setPossiblePoints(nullToZero(possible));
        row.setSnapshotVersion(question.getSnapshotVersion() == null ? 1 : question.getSnapshotVersion());
        return row;
    }

    @SuppressWarnings("unchecked")
    private QuestionSpec rebuildSpec(Map<String, Object> snapshot) {
        Map<String, Object> grading = asMap(snapshot.get("grading"));
        if (grading.isEmpty()) {
            throw new IllegalStateException("missing grading snapshot");
        }

        QuestionType type = QuestionType.valueOf(String.valueOf(grading.get("type")));
        Difficulty difficulty = parseDifficulty(grading.get("difficulty"));
        String content = firstNonBlank(
                asString(asMap(asMap(snapshot.get("student")).get("spec")).get("prompt")),
                asString(asMap(asMap(snapshot.get("student")).get("spec")).get("content")),
                "");
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
                content, difficulty, asString(grading.get("explanation")), null, List.of());

        return switch (type) {
            case SINGLE_CHOICE -> {
                List<QuestionSpec.Choice> choices = choicesFrom(grading);
                String correct = options(grading).stream()
                        .filter(o -> Boolean.TRUE.equals(o.get("correct")))
                        .map(o -> asString(o.get("key")))
                        .filter(k -> !k.isBlank())
                        .findFirst()
                        .orElse(null);
                yield new SingleChoiceSpec(common, choices, correct);
            }
            case MULTIPLE_CHOICE -> {
                List<QuestionSpec.Choice> choices = choicesFrom(grading);
                Set<String> correctKeys = new LinkedHashSet<>();
                options(grading).forEach(o -> {
                    if (Boolean.TRUE.equals(o.get("correct"))) {
                        String key = asString(o.get("key"));
                        if (!key.isBlank()) correctKeys.add(key);
                    }
                });
                yield new MultipleChoiceSpec(common, choices, correctKeys);
            }
            case TRUE_FALSE -> {
                Boolean expected = null;
                for (Map<String, Object> answer : answers(grading)) {
                    String raw = asString(answer.get("rawValue")).trim();
                    if (raw.equalsIgnoreCase("true") || raw.equalsIgnoreCase("TRUE")) {
                        expected = true;
                        break;
                    }
                    if (raw.equalsIgnoreCase("false") || raw.equalsIgnoreCase("FALSE")) {
                        expected = false;
                        break;
                    }
                }
                if (expected == null) {
                    expected = options(grading).stream()
                            .filter(o -> Boolean.TRUE.equals(o.get("correct")))
                            .map(o -> asString(o.get("key")))
                            .findFirst()
                            .map(k -> k.equalsIgnoreCase("TRUE") || k.equalsIgnoreCase("true"))
                            .orElse(null);
                }
                yield new TrueFalseSpec(common, expected);
            }
            case TYPE_ANSWER -> new TypeAnswerSpec(common, acceptedAnswers(grading),
                    parseMatchingMode(grading.get("matchingMode")));
            case FILL_IN_BLANK -> new FillInBlankSpec(common, acceptedAnswers(grading),
                    parseMatchingMode(grading.get("matchingMode")));
            case MATCHING -> {
                Map<String, Object> studentSpec = asMap(asMap(snapshot.get("student")).get("spec"));
                Map<String, Object> definition = asMap(grading.get("definition"));
                Map<String, Object> matching = asMap(definition.get("matching"));
                if (matching.isEmpty()) matching = definition;
                String poolId = firstNonBlank(asString(studentSpec.get("poolId")), asString(matching.get("poolId")));
                String correctEntryId = firstNonBlank(
                        asString(matching.get("correctEntryId")),
                        asString(matching.get("correct_entry_id")),
                        answers(grading).stream().map(a -> asString(a.get("rawValue"))).filter(s -> !s.isBlank()).findFirst().orElse(""));
                yield new MatchingSpec(common, poolId, correctEntryId);
            }
            case CLOZE -> {
                Map<String, Object> studentSpec = asMap(asMap(snapshot.get("student")).get("spec"));
                Map<String, Object> definition = asMap(grading.get("definition"));
                Map<String, Object> cloze = asMap(definition.get("cloze"));
                if (cloze.isEmpty()) cloze = definition;
                List<ClozeSpec.Segment> segments = new ArrayList<>();
                Object segs = studentSpec.get("segments");
                if (segs instanceof List<?> list) {
                    for (Object item : list) {
                        if (item instanceof Map<?, ?> map && map.get("text") instanceof String text) {
                            segments.add(new ClozeSpec.Segment(text));
                        }
                    }
                }
                List<ClozeSpec.Blank> blanks = new ArrayList<>();
                Object blankRows = cloze.get("blanks");
                if (blankRows instanceof List<?> list) {
                    for (Object item : list) {
                        if (item instanceof Map<?, ?> map && map.get("key") instanceof String key) {
                            List<String> accepted = new ArrayList<>();
                            Object acc = map.get("acceptedAnswers");
                            if (acc instanceof List<?> acceptedList) {
                                for (Object a : acceptedList) if (a != null) accepted.add(String.valueOf(a));
                            }
                            blanks.add(new ClozeSpec.Blank(key, accepted));
                        }
                    }
                }
                boolean caseSensitive = Boolean.TRUE.equals(cloze.get("caseSensitive"))
                        || Boolean.TRUE.equals(studentSpec.get("caseSensitive"));
                yield new ClozeSpec(common, segments, blanks, caseSensitive);
            }
        };
    }

    private RawAnswer toRawAnswer(QuestionType type, Map<String, Object> payload) {
        return switch (type) {
            case SINGLE_CHOICE, MATCHING -> new RawAnswer(payload.get("selectedKey"));
            case MULTIPLE_CHOICE -> new RawAnswer(payload.get("selectedKeys"));
            case TRUE_FALSE, FILL_IN_BLANK, TYPE_ANSWER -> new RawAnswer(payload.get("value"));
            case CLOZE -> new RawAnswer(payload.get("values"));
        };
    }

    private static boolean isBlankPayload(Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) return true;
        Object selectedKey = payload.get("selectedKey");
        if (selectedKey instanceof String s && !s.isBlank()) return false;
        Object value = payload.get("value");
        if (value instanceof String s && !s.isBlank()) return false;
        if (value instanceof Boolean) return false;
        Object selectedKeys = payload.get("selectedKeys");
        if (selectedKeys instanceof Collection<?> c && !c.isEmpty()) return false;
        Object values = payload.get("values");
        if (values instanceof Map<?, ?> m && !m.isEmpty()) return false;
        if (values instanceof Collection<?> c && !c.isEmpty()) return false;
        return selectedKey == null && value == null && selectedKeys == null && values == null;
    }

    private static AttemptPartStatus mapPartStatus(PartStatus status) {
        return switch (status) {
            case CORRECT -> AttemptPartStatus.CORRECT;
            case PARTIALLY_CORRECT -> AttemptPartStatus.PARTIALLY_CORRECT;
            case INCORRECT -> AttemptPartStatus.INCORRECT;
            case UNANSWERED -> AttemptPartStatus.UNANSWERED;
        };
    }

    private static AttemptPartStatus mapFraction(BigDecimal fraction) {
        if (fraction == null || fraction.signum() <= 0) return AttemptPartStatus.INCORRECT;
        if (fraction.compareTo(BigDecimal.ONE) == 0) return AttemptPartStatus.CORRECT;
        return AttemptPartStatus.PARTIALLY_CORRECT;
    }

    private static List<QuestionSpec.Choice> choicesFrom(Map<String, Object> grading) {
        List<QuestionSpec.Choice> choices = new ArrayList<>();
        for (Map<String, Object> option : options(grading)) {
            String key = asString(option.get("key"));
            String text = asString(option.get("text"));
            if (!key.isBlank()) choices.add(new QuestionSpec.Choice(key, text));
        }
        return choices;
    }

    private static List<String> acceptedAnswers(Map<String, Object> grading) {
        List<String> accepted = new ArrayList<>();
        for (Map<String, Object> answer : answers(grading)) {
            String raw = asString(answer.get("rawValue"));
            String normalized = asString(answer.get("normalizedValue"));
            if (!raw.isBlank()) accepted.add(raw);
            else if (!normalized.isBlank()) accepted.add(normalized);
        }
        return accepted;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> options(Map<String, Object> grading) {
        Object value = grading.get("options");
        if (!(value instanceof List<?> list)) return List.of();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                Map<String, Object> row = new LinkedHashMap<>();
                map.forEach((k, v) -> { if (k instanceof String s) row.put(s, v); });
                result.add(row);
            }
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> answers(Map<String, Object> grading) {
        Object value = grading.get("answers");
        if (!(value instanceof List<?> list)) return List.of();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (item instanceof Map<?, ?> map) {
                Map<String, Object> row = new LinkedHashMap<>();
                map.forEach((k, v) -> { if (k instanceof String s) row.put(s, v); });
                result.add(row);
            }
        }
        return result;
    }

    private static MatchingMode parseMatchingMode(Object value) {
        if (value == null) return MatchingMode.CASE_INSENSITIVE_TRIM;
        try {
            return MatchingMode.valueOf(String.valueOf(value));
        } catch (Exception ex) {
            return MatchingMode.CASE_INSENSITIVE_TRIM;
        }
    }

    private static Difficulty parseDifficulty(Object value) {
        if (value == null) return Difficulty.MEDIUM;
        try {
            return Difficulty.valueOf(String.valueOf(value));
        } catch (Exception ex) {
            return Difficulty.MEDIUM;
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        if (!(value instanceof Map<?, ?> map)) return Map.of();
        Map<String, Object> result = new LinkedHashMap<>();
        map.forEach((k, v) -> { if (k instanceof String s) result.put(s, v); });
        return result;
    }

    private static String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return "";
    }

    private static BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
