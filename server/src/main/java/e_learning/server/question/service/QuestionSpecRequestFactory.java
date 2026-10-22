package e_learning.server.question.service;

import e_learning.server.question.dto.request.ClozeDefinitionRequest;
import e_learning.server.question.dto.request.MatchingDefinitionRequest;
import e_learning.server.question.dto.request.QuestionWriteRequest;
import e_learning.server.question.dto.request.QuestionDefinitionRequest;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.types.choice.MultipleChoiceSpec;
import e_learning.server.question.engine.types.choice.SingleChoiceSpec;
import e_learning.server.question.engine.types.compound.ClozeSpec;
import e_learning.server.question.engine.types.compound.MatchingSpec;
import e_learning.server.question.engine.types.text.FillInBlankSpec;
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
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(request.getContent() == null ? "" : request.getContent().trim(), request.getDifficulty() == null ? Difficulty.EASY : request.getDifficulty(), request.getExplanation(), request.getHint(), List.of());
        List<QuestionSpec.Choice> choices = request.getOptions() == null ? List.of() : java.util.stream.IntStream.range(0, request.getOptions().size()).mapToObj(i -> new QuestionSpec.Choice(String.valueOf((char) ('A' + i)), request.getOptions().get(i).getContent() == null ? "" : request.getOptions().get(i).getContent().trim())).toList();
        List<String> answerValues = request.getAnswers() == null ? List.of() : request.getAnswers().stream().map(a -> a.getRawValue()).filter(Objects::nonNull).map(String::trim).filter(s -> !s.isBlank()).toList();
        return switch (request.getType()) {
            case SINGLE_CHOICE -> new SingleChoiceSpec(common, choices, correctKey(request));
            case MULTIPLE_CHOICE -> new MultipleChoiceSpec(common, choices, correctKeys(request));
            case TRUE_FALSE ->
                    new TrueFalseSpec(common, answerValues.stream().findFirst().filter(v -> "TRUE".equalsIgnoreCase(v) || "FALSE".equalsIgnoreCase(v)).map(v -> "TRUE".equalsIgnoreCase(v)).orElse(null));
            case FILL_IN_BLANK -> new FillInBlankSpec(common, answerValues, request.getMatchingMode());
            case TYPE_ANSWER -> new TypeAnswerSpec(common, answerValues, request.getMatchingMode());
            case MATCHING -> matching(common, request.getDefinition());
            case CLOZE -> cloze(common, request.getDefinition());
        };
    }

    private MatchingSpec matching(QuestionSpec.QuestionCommon common, QuestionDefinitionRequest definition) {
        MatchingDefinitionRequest d = definition == null ? null : definition.getMatching();
        return new MatchingSpec(
                common,
                d == null ? null : d.getPoolId(),
                d == null ? null : d.getCorrectEntryId()
        );
    }

    private ClozeSpec cloze(QuestionSpec.QuestionCommon common, QuestionDefinitionRequest definition) {
        ClozeDefinitionRequest d = definition == null ? null : definition.getCloze();

        if (d == null) {
            return new ClozeSpec(common, List.of(), List.of(), false);
        }

        List<ClozeSpec.Segment> segments =
                d.getSegments() == null
                        ? List.of()
                        : d.getSegments().stream()
                        .filter(Objects::nonNull)
                        .map(segment -> new ClozeSpec.Segment(
                                segment.getText() == null
                                        ? ""
                                        : segment.getText()
                        ))
                        .toList();

        List<ClozeSpec.Blank> blanks =
                d.getBlanks() == null
                        ? List.of()
                        : d.getBlanks().stream()
                        .filter(Objects::nonNull)
                        .map(blank -> new ClozeSpec.Blank(
                                blank.getKey() == null ? "" : blank.getKey(),
                                blank.getAcceptedAnswers() == null
                                        ? List.of()
                                        : blank.getAcceptedAnswers().stream()
                                                .filter(Objects::nonNull)
                                                .toList()
                        ))
                        .toList();

        return new ClozeSpec(common, segments, blanks, Boolean.TRUE.equals(d.getCaseSensitive())
        );
    }

    private String correctKey(QuestionWriteRequest r) {
        return correctKeys(r).stream().findFirst().orElse(null);
    }

    private java.util.Set<String> correctKeys(QuestionWriteRequest r) {
        if (r.getOptions() == null) return java.util.Set.of();
        return java.util.stream.IntStream.range(0, r.getOptions().size()).filter(i -> r.getOptions().get(i).isCorrect()).mapToObj(i -> String.valueOf((char) ('A' + i))).collect(Collectors.toUnmodifiableSet());
    }

}
