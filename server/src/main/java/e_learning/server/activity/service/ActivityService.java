package e_learning.server.activity.service;

import e_learning.server.activity.distribution.ActivityDistributionCalculator;
import e_learning.server.activity.dto.request.*;
import e_learning.server.activity.dto.response.*;
import e_learning.server.activity.entity.*;
import e_learning.server.activity.enums.ActivityStatus;
import e_learning.server.activity.enums.ActivityDifficulty;
import e_learning.server.activity.repository.*;
import e_learning.server.common.exception.*;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final ActivityBankRepository activityBankRepository;
    private final ActivityValidationService validationService;
    private final ActivityReadinessService readinessService;
    private final UnitRepository unitRepository;
    private final QuestionBankRepository questionBankRepository;
    private final ContentQuestionRepository contentQuestionRepository;

    @Transactional(readOnly = true)
    public List<ActivityResponse> listByUnit(Long unitId, boolean includeArchived) {
        findUnit(unitId);
        List<Activity> activities = includeArchived
                ? activityRepository.findAllByUnitIdOrderByDisplayOrderAscIdAsc(unitId)
                : activityRepository.findAllByUnitIdAndStatusNotOrderByDisplayOrderAscIdAsc(unitId, ActivityStatus.ARCHIVED);
        return activities.stream().map(this::mapResponse).toList();
    }

    @Transactional(readOnly = true)
    public ActivityResponse get(Long id) {
        return mapResponse(findActivity(id));
    }

    public ActivityResponse create(CreateActivityRequest request) {
        Unit unit = findUnit(request.unitId());
        String name = request.name().trim();

        if (activityRepository.existsByUnitIdAndNameIgnoreCase(unit.getId(), name)) {
            throw new AppException(ErrorCode.ACTIVITY_ALREADY_EXISTS);
        }

        validationService.validateActivity(
                unit, request.distributionMode(), request.totalQuestions(),
                request.availableSelectionStrategies(), request.mode(),
                request.timeLimitSeconds(), request.lives(), request.banks()
        );

        Activity activity = Activity.builder()
                .unit(unit).name(name).description(trimToNull(request.description()))
                .displayOrder(activityRepository.findMaxDisplayOrderByUnitId(unit.getId()) + 1)
                .distributionMode(request.distributionMode())
                .totalQuestions(request.totalQuestions())
                .questionDifficulty(request.questionDifficulty())
                .availableSelectionStrategies(request.availableSelectionStrategies())
                .mode(request.mode())
                .timeLimitSeconds(request.timeLimitSeconds())
                .lives(request.lives())
                .build();

        replaceBanks(activity, request.banks());
        return mapResponse(activityRepository.save(activity));
    }

    public ActivityResponse update(Long id, UpdateActivityRequest request) {
        Activity activity = findActivity(id);

        validationService.validateActivity(
                activity.getUnit(), request.distributionMode(), request.totalQuestions(),
                request.availableSelectionStrategies(), request.mode(),
                request.timeLimitSeconds(), request.lives(), request.banks()
        );

        String name = request.name().trim();
        if (activityRepository.existsByUnitIdAndNameIgnoreCaseAndIdNot(activity.getUnit().getId(), name, id)) {
            throw new AppException(ErrorCode.ACTIVITY_ALREADY_EXISTS);
        }

        activity.setName(name);
        activity.setDescription(trimToNull(request.description()));
        activity.setDistributionMode(request.distributionMode());
        activity.setTotalQuestions(request.totalQuestions());
        activity.setQuestionDifficulty(request.questionDifficulty());
        activity.setAvailableSelectionStrategies(request.availableSelectionStrategies());
        activity.setMode(request.mode());
        activity.setTimeLimitSeconds(request.timeLimitSeconds());
        activity.setLives(request.lives());

        replaceBanks(activity, request.banks());
        return mapResponse(activityRepository.save(activity));
    }

    public ActivityResponse updateStatus(Long id, UpdateActivityStatusRequest request) {
        Activity activity = findActivity(id);
        ActivityStatus current = activity.getStatus();
        ActivityStatus next = request.status();

        boolean allowed = (current == ActivityStatus.DRAFT && (next == ActivityStatus.PUBLISHED || next == ActivityStatus.ARCHIVED))
                || (current == ActivityStatus.PUBLISHED && next == ActivityStatus.ARCHIVED)
                || (current == ActivityStatus.ARCHIVED && next == ActivityStatus.DRAFT);
        if (!allowed) {
            throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
        }

        if (next == ActivityStatus.PUBLISHED) {
            if (!readinessService.validateForPublish(activity).isReady()) {
                throw new AppException(ErrorCode.ACTIVITY_NOT_READY);
            }
            activity.setPublishedAt(LocalDateTime.now());
        }
        activity.setStatus(next);
        return mapResponse(activityRepository.save(activity));
    }

    @Transactional(readOnly = true)
    public ActivityReadinessResponse readiness(Long id) {
        return readinessService.validateForPublish(findActivity(id));
    }

    @Transactional(readOnly = true)
    public ActivityPreviewResponse preview(Long id) {
        Activity activity = findActivity(id);
        List<ActivityBank> banks = activityBankRepository.findByActivityIdOrderByDisplayOrderAsc(activity.getId());
        Map<Long, Integer> allocations = ActivityDistributionCalculator.calculate(activity, banks);
        List<Long> sampleQuestionIds = new ArrayList<>();

        for (ActivityBank bank : banks) {
            Integer required = allocations.get(bank.getQuestionBank().getId());
            if (required == null || required < 1) {
                continue;
            }
            contentQuestionRepository
                    .findTop100ByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(bank.getQuestionBank().getId())
                    .stream()
                    .filter(cq -> activity.getQuestionDifficulty() == ActivityDifficulty.MIXED
                            || cq.getQuestion().getDifficulty().name().equals(activity.getQuestionDifficulty().name()))
                    .limit(required)
                    .map(contentQuestion -> contentQuestion.getQuestionId())
                    .forEach(sampleQuestionIds::add);
        }

        return ActivityPreviewResponse.builder()
                .readiness(readinessService.validateForPublish(activity))
                .sampleQuestionIds(sampleQuestionIds)
                .totalSampleQuestions(sampleQuestionIds.size())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ActivitySourceOptionResponse> sourceOptions(Long unitId) {
        findUnit(unitId);
        return questionBankRepository.findByUnitIdOrderBySectionAndTopicAndDisplayOrder(unitId)
                .stream()
                .map(bank -> {
                    var readyQuestions = contentQuestionRepository
                            .findAllByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(bank.getId());
                    return ActivitySourceOptionResponse.builder()
                            .questionBankId(bank.getId()).questionBankName(bank.getName())
                            .topicId(bank.getTopic().getId()).topicName(bank.getTopic().getName())
                            .sectionName(bank.getTopic().getSection().getName()).status(bank.getStatus())
                            .totalQuestions(contentQuestionRepository.countByQuestionBankId(bank.getId()))
                            .readyQuestions(readyQuestions.size())
                            .easyReadyQuestions(readyQuestions.stream()
                                    .filter(cq -> cq.getQuestion().getDifficulty().name().equals("EASY")).count())
                            .mediumReadyQuestions(readyQuestions.stream()
                                    .filter(cq -> cq.getQuestion().getDifficulty().name().equals("MEDIUM")).count())
                            .hardReadyQuestions(readyQuestions.stream()
                                    .filter(cq -> cq.getQuestion().getDifficulty().name().equals("HARD")).count())
                            .build();
                })
                .toList();
    }

    /** Replaces all ActivityBank children with the requested source configuration. */
    private void replaceBanks(Activity activity, List<ActivityBankRequest> requests) {
        activity.getBanks().clear();
        Set<Long> unique = new HashSet<>();

        for (ActivityBankRequest request : requests) {
            if (!unique.add(request.questionBankId())) {
                throw new AppException(ErrorCode.ACTIVITY_INVALID_CONFIGURATION);
            }

            QuestionBank bank = questionBankRepository.findById(request.questionBankId())
                    .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

            activity.getBanks().add(ActivityBank.builder()
                    .activity(activity).questionBank(bank)
                    .displayOrder(request.displayOrder())
                    .percentage(request.percentage())
                    .fixedCount(request.fixedCount())
                    .build());
        }
    }

    private ActivityResponse mapResponse(Activity activity) {
        List<ActivityBank> banks = activityBankRepository.findByActivityIdOrderByDisplayOrderAsc(activity.getId());
        var allocations = ActivityDistributionCalculator.calculate(activity, banks);
        var readiness = readinessService.validateForPublish(activity);

        List<ActivityBankResponse> bankResponses = banks.stream().map(bank ->
                ActivityBankResponse.builder()
                        .id(bank.getId()).questionBankId(bank.getQuestionBank().getId())
                        .questionBankName(bank.getQuestionBank().getName())
                        .topicId(bank.getQuestionBank().getTopic().getId())
                        .topicName(bank.getQuestionBank().getTopic().getName())
                        .sectionName(bank.getQuestionBank().getTopic().getSection().getName())
                        .displayOrder(bank.getDisplayOrder()).percentage(bank.getPercentage())
                        .fixedCount(bank.getFixedCount())
                        .totalQuestions(contentQuestionRepository.countByQuestionBankId(bank.getQuestionBank().getId()))
                        .readyQuestions(contentQuestionRepository.countByQuestionBankIdAndQuestionCompleteTrue(bank.getQuestionBank().getId()))
                        .allocatedQuestions(allocations.get(bank.getQuestionBank().getId()))
                        .build()
        ).toList();

        return ActivityResponse.builder()
                .id(activity.getId())
                .gradeId(activity.getUnit().getGrade().getId()).gradeName(activity.getUnit().getGrade().getName())
                .unitId(activity.getUnit().getId()).unitCode(activity.getUnit().getCode()).unitName(activity.getUnit().getName())
                .name(activity.getName()).description(activity.getDescription()).displayOrder(activity.getDisplayOrder())
                .status(activity.getStatus()).distributionMode(activity.getDistributionMode())
                .totalQuestions(activity.getTotalQuestions())
                .questionDifficulty(activity.getQuestionDifficulty())
                .availableSelectionStrategies(activity.getAvailableSelectionStrategies())
                .mode(activity.getMode()).timeLimitSeconds(activity.getTimeLimitSeconds()).lives(activity.getLives())
                .banks(bankResponses).readiness(readiness)
                .createdAt(activity.getCreatedAt()).updatedAt(activity.getUpdatedAt()).publishedAt(activity.getPublishedAt())
                .build();
    }

    private Activity findActivity(Long id) {
        return activityRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
    }

    private Unit findUnit(Long id) {
        return unitRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
