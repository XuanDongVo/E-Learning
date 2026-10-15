package e_learning.server.question.service;

import e_learning.server.question.dto.QuestionWriteRequest;
import e_learning.server.question.dto.QuestionDefinitionRequest;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.types.choice.MultipleChoiceSpec;
import e_learning.server.question.engine.types.choice.SingleChoiceSpec;
import e_learning.server.question.engine.types.compound.ClozeSpec;
import e_learning.server.question.engine.types.compound.MatchingSpec;
import e_learning.server.question.engine.types.text.FillInBlankSpec;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.engine.types.text.TypeAnswerSpec;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.enums.Difficulty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class QuestionSpecRequestFactory {
    public QuestionSpec toSpec(QuestionWriteRequest request) {
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
                request.getContent() == null ? "" : request.getContent().trim(),
                request.getDifficulty() == null ? Difficulty.EASY : request.getDifficulty(),
                request.getExplanation(), request.getHint(), List.of());
        List<QuestionSpec.Choice> choices = request.getOptions() == null ? List.of() :
                java.util.stream.IntStream.range(0, request.getOptions().size())
                        .mapToObj(i -> new QuestionSpec.Choice(String.valueOf((char) ('A' + i)),
                                request.getOptions().get(i).getContent() == null ? "" : request.getOptions().get(i).getContent().trim())).toList();
        List<String> answerValues = request.getAnswers() == null ? List.of() : request.getAnswers().stream()
                .map(a -> a.getRawValue()).filter(Objects::nonNull).map(String::trim).filter(s -> !s.isBlank()).toList();
        return switch (request.getType()) {
            case SINGLE_CHOICE -> new SingleChoiceSpec(common, choices, correctKey(request));
            case MULTIPLE_CHOICE -> new MultipleChoiceSpec(common, choices, correctKeys(request));
            case TRUE_FALSE -> new TrueFalseSpec(common, answerValues.stream().findFirst()
                    .filter(v -> "TRUE".equalsIgnoreCase(v) || "FALSE".equalsIgnoreCase(v))
                    .map(v -> "TRUE".equalsIgnoreCase(v)).orElse(null));
            case FILL_IN_BLANK -> new FillInBlankSpec(common, answerValues);
            case TYPE_ANSWER -> new TypeAnswerSpec(common, answerValues, MatchingMode.CASE_INSENSITIVE_TRIM);
            case MATCHING -> matching(common, request.getDefinition());
            case CLOZE -> cloze(common, request.getDefinition());
        };
    }

    private MatchingSpec matching(QuestionSpec.QuestionCommon common, QuestionDefinitionRequest definition) {
        QuestionDefinitionRequest.Matching d = definition == null ? null : definition.getMatching();
        if (d == null) return new MatchingSpec(common, List.of(), List.of(), Map.of());
        List<MatchingSpec.Item> items = d.getItems() == null ? List.of() : d.getItems().stream()
                .map(i -> new MatchingSpec.Item(i.getKey() == null ? "" : i.getKey(), i.getPrompt() == null ? "" : i.getPrompt()))
                .toList();
        return new MatchingSpec(common, items,
                d.getAnswerPool() == null ? List.of() : d.getAnswerPool(),
                d.getExpectedPairs() == null ? Map.of() : d.getExpectedPairs());
    }

    private ClozeSpec cloze(QuestionSpec.QuestionCommon common, QuestionDefinitionRequest definition) {
        QuestionDefinitionRequest.Cloze d = definition == null ? null : definition.getCloze();
        if (d == null) return new ClozeSpec(common, List.of(), List.of());
        List<ClozeSpec.Segment> segments = d.getSegments() == null ? List.of() : d.getSegments().stream()
                .map(s -> new ClozeSpec.Segment(s.getText() == null ? "" : s.getText())).toList();
        List<ClozeSpec.Blank> blanks = d.getBlanks() == null ? List.of() : d.getBlanks().stream()
                .map(b -> new ClozeSpec.Blank(b.getKey() == null ? "" : b.getKey(), b.getAcceptedAnswers()))
                .toList();
        return new ClozeSpec(common, segments, blanks);
    }

    private String correctKey(QuestionWriteRequest r) {
        return correctKeys(r).stream().findFirst().orElse(null);
    }

    private java.util.Set<String> correctKeys(QuestionWriteRequest r) {
        if (r.getOptions() == null) return java.util.Set.of();
        return java.util.stream.IntStream.range(0, r.getOptions().size()).filter(i -> r.getOptions().get(i).isCorrect())
                .mapToObj(i -> String.valueOf((char) ('A' + i))).collect(Collectors.toUnmodifiableSet());
    }
}
