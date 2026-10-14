package e_learning.server.question.service;

import e_learning.server.question.dto.QuestionWriteRequest;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.types.choice.MultipleChoiceSpec;
import e_learning.server.question.engine.types.choice.SingleChoiceSpec;
import e_learning.server.question.engine.types.compound.MatchingSpec;
import e_learning.server.question.engine.types.compound.ClozeSpec;
import e_learning.server.question.engine.types.text.FillInBlankSpec;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.engine.types.text.TypeAnswerSpec;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.enums.Difficulty;
import org.springframework.stereotype.Component;

import java.util.List;

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
                .map(a -> a.getRawValue()).filter(java.util.Objects::nonNull).map(String::trim).filter(s -> !s.isBlank()).toList();
        return switch (request.getType()) {
            case SINGLE_CHOICE -> new SingleChoiceSpec(common, choices, correctKey(request));
            case MULTIPLE_CHOICE -> new MultipleChoiceSpec(common, choices, correctKeys(request));
            case TRUE_FALSE -> new TrueFalseSpec(common, answerValues.stream().findFirst().map(v -> "TRUE".equalsIgnoreCase(v)).orElse(null));
            case FILL_IN_BLANK -> new FillInBlankSpec(common, answerValues);
            case TYPE_ANSWER -> new TypeAnswerSpec(common, answerValues, MatchingMode.CASE_INSENSITIVE_TRIM);
            case MATCHING, CLOZE -> throw new IllegalArgumentException("MATCHING and CLOZE require type-specific authoring fields");
        };
    }
    private String correctKey(QuestionWriteRequest r) { return correctKeys(r).stream().findFirst().orElse(null); }
    private java.util.Set<String> correctKeys(QuestionWriteRequest r) {
        if (r.getOptions() == null) return java.util.Set.of();
        return java.util.stream.IntStream.range(0, r.getOptions().size()).filter(i -> r.getOptions().get(i).isCorrect())
                .mapToObj(i -> String.valueOf((char) ('A' + i))).collect(java.util.stream.Collectors.toUnmodifiableSet());
    }
}
