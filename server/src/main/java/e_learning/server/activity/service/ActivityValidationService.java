package e_learning.server.activity.service;

import e_learning.server.activity.dto.request.ActivityBankRequest;
import e_learning.server.activity.enums.*;
import e_learning.server.common.exception.*;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.content.unit.entity.Unit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ActivityValidationService {
    private final QuestionBankRepository questionBankRepository;

    public void validateActivity(Unit unit, DistributionMode distributionMode, Integer totalQuestions,
                               ActivityMode mode, Integer timeLimitSeconds, Integer lives,
                               List<ActivityBankRequest> banks) {
        validateCommon(unit, distributionMode, totalQuestions, mode, timeLimitSeconds, lives, banks);
        validateSources(unit, banks);
        validateDistribution(totalQuestions, distributionMode, banks);
    }

    private void validateCommon(Unit unit, DistributionMode distributionMode, Integer totalQuestions,
                                ActivityMode mode, Integer timeLimitSeconds, Integer lives,
                                List<ActivityBankRequest> banks) {
        if (unit == null || unit.getStatus() == ContentStatus.ARCHIVED ||
            distributionMode == null || totalQuestions == null || totalQuestions < 1 ||
            mode == null || banks == null || banks.isEmpty() || totalQuestions < banks.size()) {
            throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
        }

        if (mode == ActivityMode.LEARNING) {
            if (timeLimitSeconds != null || lives != null) {
                throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
            }
        } else if (timeLimitSeconds == null || timeLimitSeconds < 1 || lives == null || lives < 1) {
            throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
        }
    }

    private void validateSources(Unit unit, List<ActivityBankRequest> requests) {
        Set<Long> ids = new HashSet<>();
        for (ActivityBankRequest request : requests) {
            if (!ids.add(request.questionBankId())) {
                throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
            }

            QuestionBank bank = questionBankRepository.findById(request.questionBankId())
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

            Long bankUnitId = bank.getTopic().getSection().getUnit().getId();
            if (!unit.getId().equals(bankUnitId)) {
                throw new AppException(ErrorCode.ACTIVITY_QUESTION_BANK_OUTSIDE_UNIT);
            }

            if (bank.getStatus() == ContentStatus.ARCHIVED) {
                throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
            }
        }
    }

    private void validateDistribution(int totalQuestions, DistributionMode mode,
                                      List<ActivityBankRequest> banks) {
        switch (mode) {
            case EQUAL -> {
                if (totalQuestions % banks.size() != 0 ||
                    banks.stream().anyMatch(b -> b.percentage() != null || b.fixedCount() != null)) {
                    throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
                }
            }
            case PERCENTAGE -> {
                if (banks.stream().anyMatch(b -> b.percentage() == null || b.fixedCount() != null) ||
                    banks.stream().mapToInt(ActivityBankRequest::percentage).sum() != 100) {
                    throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
                }
            }
            case FIXED_COUNT -> {
                if (banks.stream().anyMatch(b -> b.fixedCount() == null || b.percentage() != null) ||
                    banks.stream().mapToInt(ActivityBankRequest::fixedCount).sum() != totalQuestions) {
                    throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
                }
            }
        }
    }
}
