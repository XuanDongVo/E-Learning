package e_learning.server.activitysession.selection;

import e_learning.server.activity.distribution.ActivityDistributionCalculator;
import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.entity.ActivityBank;
import e_learning.server.activity.enums.ActivityDifficulty;
import e_learning.server.activity.repository.ActivityBankRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.question.entity.ContentQuestion;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.question.entity.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Selects the concrete question set for a new ActivitySession.
 * Runtime/session lifecycle and snapshot persistence remain owned by ActivitySessionService.
 */
@Component
@RequiredArgsConstructor
public class ActivityQuestionSelectionService {
    private final ActivityBankRepository activityBankRepository;
    private final ContentQuestionRepository contentQuestionRepository;

    public List<Question> selectQuestions(Activity activity) {
        List<ActivityBank> banks = activityBankRepository.findByActivityIdOrderByDisplayOrderAsc(activity.getId());
        Map<Long, Integer> allocations = ActivityDistributionCalculator.calculate(activity, banks);
        List<Question> result = new ArrayList<>();
        for (ActivityBank bank : banks) {
            List<Question> pool = contentQuestionRepository
                    .findAllByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(bank.getQuestionBank().getId())
                    .stream().map(ContentQuestion::getQuestion)
                    .filter(question -> activity.getQuestionDifficulty() == ActivityDifficulty.MIXED
                            || question.getDifficulty().name().equals(activity.getQuestionDifficulty().name()))
                    .collect(Collectors.toCollection(ArrayList::new));
            Collections.shuffle(pool);
            int count = allocations.getOrDefault(bank.getQuestionBank().getId(), 0);
            if (pool.size() < count) throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
            result.addAll(pool.subList(0, count));
        }
        Collections.shuffle(result);
        return result;
    }
}