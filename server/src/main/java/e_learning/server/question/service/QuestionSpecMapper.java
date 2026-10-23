package e_learning.server.question.service;

import e_learning.server.question.dto.request.ClozeDefinitionRequest;
import e_learning.server.question.dto.request.MatchingDefinitionRequest;
import e_learning.server.question.dto.request.QuestionDefinitionRequest;
import e_learning.server.question.engine.exception.QuestionEngineException;
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
import e_learning.server.question.repository.QuestionMediaRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class QuestionSpecMapper {
    private final QuestionOptionRepository options;
    private final QuestionAnswerRepository answers;
    private final QuestionMediaRepository media;
    private final ObjectMapper objectMapper;

    public QuestionSpec toSpec(Question question) {
        QuestionSpec.QuestionCommon common = new QuestionSpec.QuestionCommon(
                question.getContent(), question.getDifficulty(), question.getExplanation(), question.getHint(),
                media.findByQuestionIdOrderByDisplayOrderAsc(question.getId()).stream()
                        .map(m -> m.getMedia() == null ? null : m.getMedia().getPublicId())
                        .filter(Objects::nonNull).toList());
        return switch (question.getType()) {
            case SINGLE_CHOICE -> new SingleChoiceSpec(common, choices(question), correctKeys(question).stream().findFirst().orElse(null));
            case MULTIPLE_CHOICE -> new MultipleChoiceSpec(common, choices(question), correctKeys(question));
            case TRUE_FALSE -> new TrueFalseSpec(common, answerValue(question).map("TRUE"::equalsIgnoreCase).orElse(null));
            case FILL_IN_BLANK -> new FillInBlankSpec(common, answerValues(question), matchingMode(question));
            case TYPE_ANSWER -> new TypeAnswerSpec(common, answerValues(question), matchingMode(question));
            case MATCHING -> matchingSpec(common, question);
            case CLOZE -> clozeSpec(common, question);
        };
    }

    private MatchingSpec matchingSpec(QuestionSpec.QuestionCommon common, Question question) {
        QuestionDefinitionRequest definition = readDefinition(question);
        MatchingDefinitionRequest matching = definition == null ? null : definition.getMatching();
        return new MatchingSpec(common, matching == null ? null : matching.getPoolId(),
                matching == null ? null : matching.getCorrectEntryId());
    }

    private ClozeSpec clozeSpec(QuestionSpec.QuestionCommon common, Question question) {
        QuestionDefinitionRequest definition = readDefinition(question);
        ClozeDefinitionRequest cloze = definition == null ? null : definition.getCloze();
        if (cloze == null) return new ClozeSpec(common, List.of(), List.of(), false);
        List<ClozeSpec.Segment> segments = cloze.getSegments() == null ? List.of() : cloze.getSegments().stream()
                .filter(Objects::nonNull).map(segment -> new ClozeSpec.Segment(segment.getText() == null ? "" : segment.getText())).toList();
        List<ClozeSpec.Blank> blanks = new ArrayList<>();
        if (cloze.getBlanks() != null) {
            for (int index = 0; index < cloze.getBlanks().size(); index++) {
                ClozeDefinitionRequest.Blank blank = cloze.getBlanks().get(index);
                if (blank == null) continue;
                String key = blank.getKey() == null || blank.getKey().isBlank() ? "blank-" + (index + 1) : blank.getKey();
                List<String> acceptedAnswers = blank.getAcceptedAnswers() == null ? List.of() : blank.getAcceptedAnswers().stream()
                        .filter(Objects::nonNull).toList();
                blanks.add(new ClozeSpec.Blank(key, acceptedAnswers));
            }
        }
        return new ClozeSpec(common, segments, blanks, Boolean.TRUE.equals(cloze.getCaseSensitive()));
    }

    private QuestionDefinitionRequest readDefinition(Question question) {
        String json = question.getDefinition();
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, QuestionDefinitionRequest.class);
        } catch (Exception ex) {
            throw new QuestionEngineException("Unable to deserialize saved question definition", ex);
        }
    }

    private List<QuestionSpec.Choice> choices(Question q) {
        return options.findByQuestionId(q.getId()).stream()
                .map(o -> new QuestionSpec.Choice(o.getOptionKey(), o.getContent())).toList();
    }

    private java.util.Set<String> correctKeys(Question q) {
        return options.findByQuestionId(q.getId()).stream().filter(e_learning.server.question.entity.QuestionOption::isCorrect)
                .map(e_learning.server.question.entity.QuestionOption::getOptionKey)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
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
