package e_learning.server.activity.service;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityDifficulty;
import e_learning.server.activity.enums.ActivityPracticeType;
import e_learning.server.content.question.entity.ContentQuestion;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.guided.GuidedDefinitionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/** One eligibility rule is shared by readiness, preview, source counts and eventual runtime selection. */
@Service
@RequiredArgsConstructor
public class ActivityQuestionEligibilityService {
    private final ContentQuestionRepository contentQuestionRepository;

    public List<ContentQuestion> eligibleQuestions(Activity activity, Long questionBankId) {
        return candidates(activity.getPracticeType(), questionBankId).stream()
                .filter(question -> isActivitySupportedType(question.getQuestion().getType()))
                .filter(question -> activity.getQuestionDifficulty() == ActivityDifficulty.MIXED
                        || question.getQuestion().getDifficulty().name()
                        .equals(activity.getQuestionDifficulty().name()))
                .toList();
    }

    public List<ContentQuestion> classicCandidates(Long questionBankId) {
        return filterSupported(candidates(ActivityPracticeType.CLASSIC, questionBankId));
    }

    public List<ContentQuestion> guidedCandidates(Long questionBankId) {
        return filterSupported(candidates(ActivityPracticeType.GUIDED_REASONING, questionBankId));
    }

    private List<ContentQuestion> candidates(ActivityPracticeType practiceType, Long questionBankId) {
        if (practiceType == ActivityPracticeType.GUIDED_REASONING) {
            return contentQuestionRepository.findAllGuidedReadyByQuestionBankIdOrderByQuestionIdAsc(
                    questionBankId, GuidedDefinitionStatus.READY);
        }
        return contentQuestionRepository.findAllByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(questionBankId);
    }

    private List<ContentQuestion> filterSupported(List<ContentQuestion> candidates) {
        return candidates.stream()
                .filter(question -> isActivitySupportedType(question.getQuestion().getType()))
                .toList();
    }

    private boolean isActivitySupportedType(QuestionType type) {
        return type == QuestionType.SINGLE_CHOICE
                || type == QuestionType.MULTIPLE_CHOICE
                || type == QuestionType.TRUE_FALSE
                || type == QuestionType.FILL_IN_BLANK
                || type == QuestionType.TYPE_ANSWER;
    }
}
