package e_learning.server.activity.service;

import e_learning.server.activity.distribution.ActivityDistributionCalculator;
import e_learning.server.activity.dto.response.*;
import e_learning.server.activity.entity.*;
import e_learning.server.activity.repository.ActivityBankRepository;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.question.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityReadinessService {
    private final QuestionRepository questionRepository;
    private final ActivityBankRepository activityBankRepository;

    public ActivityReadinessResponse evaluate(Activity activity) {
        List<ActivityBank> banks =
            activityBankRepository.findByActivityIdOrderByDisplayOrderAsc(activity.getId());

        Map<Long, Integer> allocations =
            ActivityDistributionCalculator.calculate(activity, banks);

        List<ActivitySourceAvailability> sources = new ArrayList<>();
        List<ActivityReadinessResponse.ReadinessIssue> errors = new ArrayList<>();

        for (ActivityBank bank : banks) {
            long total = questionRepository.countByQuestionBankId(bank.getQuestionBank().getId());
            long ready = questionRepository.countByQuestionBankIdAndCompleteTrue(bank.getQuestionBank().getId());
            Integer required = allocations.get(bank.getQuestionBank().getId());
            ContentStatus status = bank.getQuestionBank().getStatus();

            sources.add(ActivitySourceAvailability.builder()
                .questionBankId(bank.getQuestionBank().getId())
                .questionBankName(bank.getQuestionBank().getName())
                .sectionName(bank.getQuestionBank().getTopic().getSection().getName())
                .topicName(bank.getQuestionBank().getTopic().getName())
                .status(status)
                .totalQuestions(total)
                .readyQuestions(ready)
                .requiredQuestions(required)
                .build());

            if (status != ContentStatus.PUBLISHED) {
                errors.add(issue("QUESTION_BANK_NOT_PUBLISHED",
                    "Question bank must be published.", bank, required, ready));
            } else if (required == null || ready < required) {
                errors.add(issue("INSUFFICIENT_READY_QUESTIONS",
                    "Question bank does not contain enough ready questions.",
                    bank, required, ready));
            }
        }

        boolean allocationValid = !banks.isEmpty()
            && allocations.values().stream().allMatch(v -> v != null && v > 0)
            && allocations.values().stream().mapToInt(Integer::intValue).sum()
                == activity.getTotalQuestions();

        if (!allocationValid) {
            errors.add(ActivityReadinessResponse.ReadinessIssue.builder()
                .code("INVALID_ALLOCATION")
                .message("The activity question allocation is invalid.")
                .build());
        }

        return ActivityReadinessResponse.builder()
            .ready(errors.isEmpty())
            .errors(errors)
            .warnings(List.of())
            .sources(sources)
            .build();
    }

    private ActivityReadinessResponse.ReadinessIssue issue(String code, String message,
                                                           ActivityBank bank, Integer required,
                                                           long available) {
        return ActivityReadinessResponse.ReadinessIssue.builder()
            .code(code).message(message)
            .questionBankId(bank.getQuestionBank().getId())
            .required(required).available(available)
            .build();
    }
}
