package e_learning.server.question.service;

import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.types.choice.MultipleChoiceSpec;
import e_learning.server.question.engine.types.choice.SingleChoiceSpec;
import e_learning.server.question.engine.types.compound.ClozeSpec;
import e_learning.server.question.engine.types.compound.MatchingSpec;
import e_learning.server.question.engine.types.text.FillInBlankSpec;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.engine.types.text.TypeAnswerSpec;
import e_learning.server.question.engine.types.truefalse.TrueFalseSpec;
import e_learning.server.question.entity.Question;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.question.repository.QuestionMediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class QuestionSpecMapper {
    private final QuestionOptionRepository options;
    private final QuestionAnswerRepository answers;
    private final QuestionMediaRepository media;

    public QuestionSpec toSpec(Question question) {
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
                question.getContent(), question.getDifficulty(), question.getExplanation(), question.getHint(),
                media.findByQuestionIdOrderByDisplayOrderAsc(question.getId()).stream()
                        .map(m -> m.getMedia() == null ? null : m.getMedia().getPublicId())
                        .filter(java.util.Objects::nonNull).toList());
        return switch (question.getType()) {
            case SINGLE_CHOICE ->
                    new SingleChoiceSpec(common, choices(question), correctKeys(question).stream().findFirst().orElse(null));
            case MULTIPLE_CHOICE -> new MultipleChoiceSpec(common, choices(question), correctKeys(question));
            case TRUE_FALSE ->
                    new TrueFalseSpec(common, answerValue(question).map(v -> "TRUE".equalsIgnoreCase(v)).orElse(null));
            case FILL_IN_BLANK -> new FillInBlankSpec(common, answerValues(question));
            case TYPE_ANSWER -> new TypeAnswerSpec(common, answerValues(question), matchingMode(question));
            case MATCHING, CLOZE ->
                    throw new IllegalArgumentException("MATCHING and CLOZE are not supported by the current flat persistence model");
        };
    }

    private List<QuestionSpec.Choice> choices(Question q) {
        return options.findByQuestionId(q.getId()).stream()
                .map(o -> new QuestionSpec.Choice(o.getOptionKey(), o.getContent())).toList();
    }

    private java.util.Set<String> correctKeys(Question q) {
        return options.findByQuestionId(q.getId()).stream().filter(e_learning.server.question.entity.QuestionOption::isCorrect)
                .map(e_learning.server.question.entity.QuestionOption::getOptionKey).collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    private List<String> answerValues(Question q) {
        return answers.findByQuestionId(q.getId()).stream().map(a -> a.getRawValue()).toList();
    }

    private java.util.Optional<String> answerValue(Question q) {
        return answerValues(q).stream().findFirst();
    }

    private MatchingMode matchingMode(Question q) {
        return "CASE_SENSITIVE_TRIM".equals(q.getMatchingMode()) ? MatchingMode.CASE_SENSITIVE_TRIM : MatchingMode.CASE_INSENSITIVE_TRIM;
    }
}
