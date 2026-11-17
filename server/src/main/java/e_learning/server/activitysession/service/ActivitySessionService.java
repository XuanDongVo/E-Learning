package e_learning.server.activitysession.service;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.ActivityPracticeType;
import e_learning.server.activity.enums.ActivityStatus;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.activity.repository.ActivityRepository;
import e_learning.server.activity.service.ActivityReadinessService;
import e_learning.server.activitysession.dto.request.ActivitySessionAnswerRequest;
import e_learning.server.activitysession.dto.request.ActivitySessionStartRequest;
import e_learning.server.activitysession.dto.request.GuidedStepAnswerRequest;
import e_learning.server.activitysession.dto.response.*;
import e_learning.server.activitysession.entity.*;
import e_learning.server.activitysession.enums.ActivityHistoryPeriod;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.activitysession.enums.QuestionDeliveryType;
import e_learning.server.activitysession.guided.GuidedRuntimeService;
import e_learning.server.activitysession.repository.ActivitySessionFinalAnswerAttemptRepository;
import e_learning.server.activitysession.repository.ActivitySessionQuestionRepository;
import e_learning.server.activitysession.repository.ActivitySessionRepository;
import e_learning.server.activitysession.selection.ActivityQuestionSelectionService;
import e_learning.server.activitysession.snapshot.ActivityQuestionSnapshotAssembler;
import e_learning.server.activitysession.ordering.OrderingRuntimeService;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.gamification.streak.service.StudentStreakService;
import e_learning.server.gamification.xp.dto.ActivityXpPolicySnapshot;
import e_learning.server.gamification.xp.dto.ActivityXpQuestionReceipt;
import e_learning.server.gamification.xp.dto.ActivityXpRewardReceipt;
import e_learning.server.gamification.xp.service.ActivityXpRewardWorkflow;
import e_learning.server.gamification.xp.service.ActivityXpSessionAuditService;
import e_learning.server.question.entity.Question;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ActivitySessionService {
    private static final int NETWORK_GRACE_SECONDS = 5;
    private final ActivityRepository activityRepository;
    private final ActivityReadinessService readinessService;
    private final ActivitySessionRepository sessionRepository;
    private final ActivitySessionQuestionRepository sessionQuestionRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRepository userRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionAnswerRepository answerRepository;
    private final ActivityQuestionSnapshotAssembler snapshotAssembler;
    private final OrderingRuntimeService orderingRuntimeService;
    private final ActivityQuestionSelectionService questionSelectionService;
    private final GuidedRuntimeService guidedRuntimeService;
    private final ActivitySessionFinalAnswerAttemptRepository finalAnswerAttemptRepository;
    private final ActivityXpSessionAuditService activityXpAuditService;
    private final ActivityXpRewardWorkflow activityXpRewardWorkflow;
    private final StudentStreakService studentStreakService;


    @Transactional(readOnly = true)
    public PageResponse<ActivitySessionHistoryItemResponse> getActivitySessions(
            int page,
            int size,
            Long activityId,
            Long userId,
            ActivityHistoryPeriod period,
            ActivityMode mode,
            ActivitySessionStatus status
    ) {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        if (!hasCurrentGradeAccess(student.getId(), activity.getUnit().getGrade().getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACCESSIBLE);
        }
        if (status == ActivitySessionStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_HISTORY_STATUS_INVALID);
        }
        if (mode == ActivityMode.BOTH) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_MODE);
        }

        int safePage = Math.max(0, page - 1);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);

        ActivityHistoryPeriod selectedPeriod = period == null ? ActivityHistoryPeriod.ALL : period;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from = null;
        LocalDateTime to = null;

        switch (selectedPeriod) {
            case TODAY -> {
                from = now.toLocalDate().atStartOfDay();
                to = from.plusDays(1);
            }
            case LAST_7_DAYS -> {
                from = now.minusDays(7);
                to = now;
            }
            case LAST_30_DAYS -> {
                from = now.minusDays(30);
                to = now;
            }
            case ALL -> {
            }
        }

        final LocalDateTime fromTime = from;
        final LocalDateTime toTime = to;

        Specification<ActivitySession> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("student").get("id"), userId));

            predicates.add(cb.equal(root.get("activity").get("id"), activityId));

            predicates.add(root.get("completedAt").isNotNull());

            predicates.add(cb.notEqual(root.get("status"), ActivitySessionStatus.IN_PROGRESS));

            if (mode != null) {
                predicates.add(cb.equal(root.get("mode"), mode));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (fromTime != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("completedAt"), fromTime));
            }

            if (toTime != null) {
                predicates.add(cb.lessThan(root.get("completedAt"), toTime));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(safePage, safeSize,
                Sort.by(Sort.Order.desc("completedAt"), Sort.Order.desc("id"))
        );

        Page<ActivitySessionHistoryItemResponse> result = sessionRepository.findAll(spec, pageable)
                .map(ActivitySessionHistoryItemResponse::fromEntity);

        return PageResponse.from(result);
    }


    @Transactional(readOnly = true)
    public ActivitySessionOptionsResponse options(Long activityId, Long studentId) {
        User student = userRepository.findById(studentId).orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        Activity activity = activityRepository.findById(activityId).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        if (activity.getStatus() != ActivityStatus.PUBLISHED
                || !readinessService.validateForPublish(activity).isReady()
                || !hasCurrentGradeAccess(student.getId(), activity.getUnit().getGrade().getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACCESSIBLE);
        }
        return new ActivitySessionOptionsResponse(activity.getId(), activity.getMode(), activity.getQuestionDifficulty(),
                activity.getAvailableSelectionStrategies(), activity.getTimeLimitSeconds(), activity.getLives());
    }

    @Transactional
    public ActivitySessionResponse start(Long activityId, Long studentId, ActivitySessionStartRequest request) {
        User student = userRepository.findByIdForGamificationUpdate(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        Activity activity = activityRepository.findById(activityId).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        if (activity.getStatus() != ActivityStatus.PUBLISHED
                || !readinessService.validateForPublish(activity).isReady()
                || !hasCurrentGradeAccess(studentId, activity.getUnit().getGrade().getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACCESSIBLE);
        }

        ActivityMode mode = resolveMode(activity, request == null ? null : request.mode());
        SelectionStrategy strategy = resolveStrategy(activity, request == null ? null : request.selectionStrategy());
        List<Question> selected = questionSelectionService.selectQuestions(activity);
        List<ActivityQuestionSnapshot> questionSnapshots = selected.stream()
                .map(snapshotAssembler::assemble)
                .toList();

        // Lock order for start is active Session(s) before profile, matching the
        // reward-critical order required by Phase 3.
        List<ActivitySession> openSessions = sessionRepository.findAllByStudentIdAndStatusInForUpdate(
                studentId, List.of(ActivitySessionStatus.IN_PROGRESS));
        openSessions.forEach(this::abandon);
        openSessions.forEach(this::settleXpIfTerminal);
        Optional<ActivityXpPolicySnapshot> xpPolicy = activityXpAuditService.captureStartSnapshot(
                studentId, questionSnapshots);

        Integer timeLimitSeconds = mode == ActivityMode.TRY_HARD ? activity.getTimeLimitSeconds() : null;
        ActivitySession session = new ActivitySession(student, activity, mode, strategy, selected.size(),
                mode == ActivityMode.TRY_HARD ? activity.getLives() : null, timeLimitSeconds);
        xpPolicy.ifPresent(snapshot -> activityXpAuditService.applyStartSnapshot(session, snapshot));
        for (int i = 0; i < selected.size(); i++) {
            ActivitySessionQuestion item = new ActivitySessionQuestion(selected.get(i), i, questionSnapshots.get(i));
            QuestionDeliveryType deliveryType =
                    activity.getPracticeType() == ActivityPracticeType.GUIDED_REASONING
                            ? QuestionDeliveryType.GUIDED_REASONING
                            : QuestionDeliveryType.CLASSIC;
            item.setDeliveryType(deliveryType);
            if (deliveryType == QuestionDeliveryType.GUIDED_REASONING) {
                guidedRuntimeService.initialize(item);
            }
            session.addQuestion(item);
        }
        ActivitySession saved = sessionRepository.save(session);
        serveCurrent(saved);
        return toResponse(saved);
    }

    @Transactional
    public ActivitySessionResponse get(Long sessionId, Long studentId) {
        ActivitySession session = ownSessionForUpdate(sessionId, studentId);
        if (session.getStatus() == ActivitySessionStatus.IN_PROGRESS) {
            requireCurrentGradeAccess(session, studentId);
            serveCurrent(session);
        }
        return toResponse(session);
    }

    @Transactional
    public ActivitySessionAnswerResponse answer(Long sessionId, Long questionId, Long studentId,
                                                ActivitySessionAnswerRequest request) {
        ActivitySession session = ownSessionForUpdate(sessionId, studentId);
        requireCurrentGradeAccess(session, studentId);
        ActivitySessionQuestion item = question(sessionId, questionId);
        UUID requestId = finalRequestId(request.requestId());
        ActivitySessionFinalAnswerAttempt existing = finalAnswerAttemptRepository
                .findBySessionQuestionIdAndRequestId(item.getId(), requestId).orElse(null);
        if (existing != null) {
            if (!existing.getSubmittedAnswer().equals(answerPayload(request.answer()))) {
                throw new AppException(ErrorCode.ACTIVITY_SESSION_IDEMPOTENCY_CONFLICT);
            }
            ActivityQuestionSnapshot storedSnapshot = snapshotAssembler.read(item);
            return new ActivitySessionAnswerResponse(toResponse(session), existing.isCorrect(),
                    existing.isRetryAvailable(), existing.isAnswerRevealed(),
                    existing.isAnswerRevealed() ? correctAnswer(storedSnapshot) : null,
                    existing.isAnswerRevealed() ? correctOrderingAnswer(storedSnapshot) : null,
                    existing.isAnswerRevealed() ? storedSnapshot.explanation() : null);
        }
        requireActive(session);
        if (item.isResolved()) throw new AppException(ErrorCode.ACTIVITY_SESSION_RETRY_EXHAUSTED);
        requireGuidedFinalAvailable(item);
        requireCurrentTryHardQuestion(session, item);
        serveCurrent(session);
        ActivityQuestionSnapshot snapshot = snapshotAssembler.read(item);
        if (session.getMode() == ActivityMode.TRY_HARD && isTimedOut(item)) {
            // A late answer is a timeout, not a wrong submitted answer: no life lost.
            resolveTimedOutQuestion(session, item, snapshot);
            settleXpIfTerminal(session);
            sessionRepository.save(session);
            return new ActivitySessionAnswerResponse(toResponse(session), false, false, true,
                    correctAnswer(snapshot), correctOrderingAnswer(snapshot), snapshot.explanation());
        }
        boolean correct = isCorrect(snapshot, request.answer());
        int attempt = item.getAnswerAttempts() + 1;
        item.setAnswerAttempts(attempt);
        boolean retry = session.getMode() == ActivityMode.LEARNING && !correct && attempt == 1;
        boolean reveal = false;
        if (attempt == 1 && correct) {
            item.setFirstCorrect(true);
            item.setFinalCorrect(true);
            item.setResolved(true);
            item.setResolutionReason(ActivityQuestionResolution.CORRECT);
            session.setFirstCorrectCount(session.getFirstCorrectCount() + 1);
            session.setFinalCorrectCount(session.getFinalCorrectCount() + 1);
        } else if (retry) {
            item.setFirstCorrect(false);
        } else {
            item.setFinalCorrect(correct);
            item.setResolved(true);
            item.setResolutionReason(correct ? ActivityQuestionResolution.CORRECT : ActivityQuestionResolution.WRONG);
            reveal = !correct;
            if (Boolean.FALSE.equals(item.getFirstCorrect())) {
                // A correct retry is final-correct but is not first-correct.
                if (correct) session.setFinalCorrectCount(session.getFinalCorrectCount() + 1);
            } else if (correct) {
                session.setFinalCorrectCount(session.getFinalCorrectCount() + 1);
            }
            if (session.getMode() == ActivityMode.TRY_HARD && !correct) {
                session.setLives(session.getLives() - 1);
                if (session.getLives() <= 0) {
                    session.setStatus(ActivitySessionStatus.GAME_OVER);
                    session.setCompletedAt(LocalDateTime.now());
                    session.setScore(score(session));
                }
            }
        }
        if (item.isResolved()) {
            guidedRuntimeService.markFinalResolved(item);
            activityXpAuditService.auditResolvedQuestion(item, snapshot);
        } else if (retry) {
            guidedRuntimeService.markFinalRetry(item);
        }
        finalAnswerAttemptRepository.save(new ActivitySessionFinalAnswerAttempt(
                item, attempt, requestId, answerPayload(request.answer()),
                correct, retry, item.isResolved(), reveal));
        advanceAfterResolution(session);
        settleXpIfTerminal(session);
        sessionRepository.save(session);
        String correctAnswer = reveal ? correctAnswer(snapshot) : null;
        var orderingAnswer = reveal ? correctOrderingAnswer(snapshot) : null;
        String explanation = reveal ? snapshot.explanation() : null;
        return new ActivitySessionAnswerResponse(toResponse(session), correct, retry, reveal,
                correctAnswer, orderingAnswer, explanation);
    }

    private UUID finalRequestId(String requestId) {
        if (requestId == null || requestId.isBlank()) return UUID.randomUUID();
        try {
            return UUID.fromString(requestId);
        } catch (IllegalArgumentException error) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "requestId must be a UUID");
        }
    }

    private String answerPayload(JsonNode answer) {
        return answer == null ? "null" : answer.toString();
    }

    /**
     * Idempotent synchronization endpoint for the current Try Hard question.
     * The deadline + network grace is enforced by the server, not the browser.
     * A call before expiry returns an unchanged session so the client can poll.
     */
    @Transactional
    public ActivitySessionResponse timeout(Long sessionId, Long questionId, Long studentId) {
        ActivitySession session = ownSessionForUpdate(sessionId, studentId);
        if (session.getMode() != ActivityMode.TRY_HARD) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_MODE);
        }
        if (session.getStatus() != ActivitySessionStatus.IN_PROGRESS) {
            return toResponse(session);
        }
        requireCurrentGradeAccess(session, studentId);
        ActivitySessionQuestion item = question(sessionId, questionId);
        requireGuidedFinalAvailable(item);
        if (item.isResolved()) {
            return toResponse(session);
        }
        requireCurrentTryHardQuestion(session, item);
        serveCurrent(session);
        if (isTimedOut(item)) {
            resolveTimedOutQuestion(session, item, snapshotAssembler.read(item));
            settleXpIfTerminal(session);
            sessionRepository.save(session);
        }
        return toResponse(session);
    }

    @Transactional
    public ActivitySessionHintResponse hint(Long sessionId, Long questionId, Long studentId) {
        ActivitySession session = ownSessionForUpdate(sessionId, studentId);
        requireActive(session);
        requireCurrentGradeAccess(session, studentId);
        if (session.getMode() != ActivityMode.LEARNING)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_HINT_UNAVAILABLE);
        ActivitySessionQuestion item = question(sessionId, questionId);
        requireGuidedFinalAvailable(item);
        ActivityQuestionSnapshot snapshot = snapshotAssembler.read(item);
        if (item.isResolved() || snapshot.hint() == null || snapshot.hint().isBlank()) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_HINT_UNAVAILABLE);
        }
        if (!item.isHintUsed()) {
            item.setHintUsed(true);
            session.setHintUsedCount(session.getHintUsedCount() + 1);
            sessionRepository.save(session);
        }
        return new ActivitySessionHintResponse(toResponse(session), snapshot.hint());
    }

    @Transactional
    public ActivitySessionResponse finish(Long sessionId, Long studentId) {
        ActivitySession session = ownSessionForUpdate(sessionId, studentId);
        requireActive(session);
        requireCurrentGradeAccess(session, studentId);
        if (session.getQuestions().stream().allMatch(ActivitySessionQuestion::isResolved)) complete(session);
        else abandon(session);
        settleXpIfTerminal(session);
        sessionRepository.save(session);
        return toResponse(session);
    }

    @Transactional
    public GuidedStepAnswerResponse answerGuidedStep(Long sessionId, Long questionId, String stepKey,
                                                     Long studentId, GuidedStepAnswerRequest request) {
        ActivitySession session = ownSessionForUpdate(sessionId, studentId);
        requireActive(session);
        requireCurrentGradeAccess(session, studentId);
        ActivitySessionQuestion item = question(sessionId, questionId);
        if (!guidedRuntimeService.isGuided(item)) throw new AppException(ErrorCode.GUIDED_STEP_OUT_OF_ORDER);
        GuidedRuntimeService.StepResult result = guidedRuntimeService.answer(item, stepKey, request.requestId(), request.answer());
        sessionRepository.save(session);
        return new GuidedStepAnswerResponse(toResponse(session), result.correct(), result.attemptNumber(),
                result.retryAvailable(), result.stepResolved(), result.stage());
    }

    @Transactional
    public GuidedStepHintResponse hintGuidedStep(Long sessionId, Long questionId, String stepKey, Long studentId) {
        ActivitySession session = ownSessionForUpdate(sessionId, studentId);
        requireActive(session);
        requireCurrentGradeAccess(session, studentId);
        ActivitySessionQuestion item = question(sessionId, questionId);
        if (!guidedRuntimeService.isGuided(item)) throw new AppException(ErrorCode.GUIDED_STEP_OUT_OF_ORDER);
        String hint = guidedRuntimeService.useHint(item, stepKey);
        sessionRepository.save(session);
        return new GuidedStepHintResponse(toResponse(session), hint);
    }

    @Transactional(readOnly = true)
    public ActivitySessionResultResponse result(Long sessionId, Long studentId) {
        ActivitySession session = ownSession(sessionId, studentId);
        if (session.getStatus() == ActivitySessionStatus.IN_PROGRESS)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACTIVE);
        Optional<ActivityXpRewardReceipt> reward = activityXpRewardWorkflow.findFinalizedReward(sessionId);
        List<ActivityXpQuestionReceipt> questionReceipts = reward.isEmpty()
                || session.getStatus() == ActivitySessionStatus.ABANDONED
                ? List.of()
                : session.getQuestions().stream()
                .filter(ActivitySessionQuestion::isResolved)
                .map(item -> new ActivityXpQuestionReceipt(
                        item.getId(), item.getXpOutcome(), item.getXpBase(), item.getXpFinal()))
                .toList();
        return new ActivitySessionResultResponse(session.getId(), session.getStatus(), session.getMode(),
                session.getSelectionStrategy(), session.getTotalQuestions(), session.getFirstCorrectCount(),
                session.getFinalCorrectCount(), session.getHintUsedCount(), session.getScore(), session.getLives(),
                reward.orElse(null), questionReceipts);
    }

    private ActivityMode resolveMode(Activity activity, ActivityMode requested) {
        if (activity.getMode() == ActivityMode.BOTH) {
            if (requested == null || requested == ActivityMode.BOTH)
                throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_MODE);
            return requested;
        }
        if (requested != null && requested != activity.getMode())
            throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_MODE);
        return activity.getMode();
    }

    private SelectionStrategy resolveStrategy(Activity activity, SelectionStrategy requested) {
        List<SelectionStrategy> available = activity.getAvailableSelectionStrategies();
        if (available.size() > 1 && requested == null)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_STRATEGY);
        SelectionStrategy selected = requested == null ? available.get(0) : requested;
        if (!available.contains(selected)) throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_STRATEGY);
        return selected;
    }

    private void serveCurrent(ActivitySession session) {
        session.getQuestions().stream().filter(q -> !q.isResolved()).findFirst()
                .ifPresent(this::serve);
    }

    /**
     * First time a question is shown: stamp servedAt and (Try Hard) deadline from the
     * session-level timeLimitSeconds snapshot — not the live Activity row (ADR 0025).
     */
    private void serve(ActivitySessionQuestion item) {
        if (item.getServedAt() != null) return;
        LocalDateTime now = LocalDateTime.now();
        item.setServedAt(now);
        ActivitySession session = item.getSession();
        if (session.getMode() != ActivityMode.TRY_HARD) {
            return;
        }
        Integer limit = session.getTimeLimitSeconds();
        if (limit == null && session.getActivity() != null) {
            // Legacy sessions created before the snapshot column
            limit = session.getActivity().getTimeLimitSeconds();
        }
        if (limit != null && limit > 0) {
            item.setDeadlineAt(now.plusSeconds(limit));
        }
    }

    private boolean isTimedOut(ActivitySessionQuestion item) {
        return item.getDeadlineAt() != null && LocalDateTime.now().isAfter(item.getDeadlineAt().plusSeconds(NETWORK_GRACE_SECONDS));
    }

    /**
     * Try Hard only accepts the first unresolved question, not a future ID supplied by a client.
     */
    private void requireCurrentTryHardQuestion(ActivitySession session, ActivitySessionQuestion item) {
        if (session.getMode() != ActivityMode.TRY_HARD) return;
        ActivitySessionQuestion current = session.getQuestions().stream()
                .filter(q -> !q.isResolved())
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACTIVE));
        if (!Objects.equals(current.getId(), item.getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_QUESTION_OUT_OF_ORDER);
        }
    }

    private void resolveTimedOutQuestion(
            ActivitySession session,
            ActivitySessionQuestion item,
            ActivityQuestionSnapshot snapshot) {
        item.setFirstCorrect(false);
        item.setFinalCorrect(false);
        item.setResolved(true);
        item.setResolutionReason(ActivityQuestionResolution.TIMEOUT);
        activityXpAuditService.auditResolvedQuestion(item, snapshot);
        // Timeout does NOT increment answerAttempts and does NOT deduct a life.
        advanceAfterResolution(session);
    }

    /**
     * Start the next question's server timer immediately after the previous one is resolved.
     */
    private void advanceAfterResolution(ActivitySession session) {
        if (session.getStatus() != ActivitySessionStatus.IN_PROGRESS) return;
        if (session.getQuestions().stream().allMatch(ActivitySessionQuestion::isResolved)) {
            complete(session);
        } else {
            serveCurrent(session);
        }
    }

    private boolean isCorrect(ActivityQuestionSnapshot snapshot, JsonNode node) {
        if (snapshot.type() == e_learning.server.question.enums.QuestionType.ORDERING) {
            return orderingRuntimeService.grade(snapshot, node);
        }
        if (node == null) return false;
        if (snapshot.type() == e_learning.server.question.enums.QuestionType.MULTIPLE_CHOICE) {
            Set<String> submitted = new TreeSet<>();
            node.forEach(n -> submitted.add(n.asText().trim().toUpperCase()));
            Set<String> expected = snapshot.options().stream().filter(ActivityQuestionSnapshot.Option::correct)
                    .map(ActivityQuestionSnapshot.Option::key).collect(java.util.stream.Collectors.toCollection(TreeSet::new));
            return submitted.equals(expected);
        }
        String value = node.isArray() ? node.toString() : node.asText().trim();
        if (snapshot.type() == e_learning.server.question.enums.QuestionType.SINGLE_CHOICE) {
            return snapshot.options().stream()
                    .anyMatch(o -> o.key().equalsIgnoreCase(value) && o.correct());
        }
        return snapshot.answers().stream()
                .anyMatch(a -> a.trim().equalsIgnoreCase(value));
    }

    private String correctAnswer(ActivityQuestionSnapshot snapshot) {
        if (snapshot.type() == e_learning.server.question.enums.QuestionType.ORDERING) return null;
        if (snapshot.type() == e_learning.server.question.enums.QuestionType.SINGLE_CHOICE
                || snapshot.type() == e_learning.server.question.enums.QuestionType.MULTIPLE_CHOICE)
            return snapshot.options().stream().filter(ActivityQuestionSnapshot.Option::correct)
                    .map(ActivityQuestionSnapshot.Option::key).sorted().collect(java.util.stream.Collectors.joining(","));
        return snapshot.answers().stream()
                .collect(java.util.stream.Collectors.joining(", "));
    }

    private e_learning.server.activitysession.dto.response.ordering.OrderingAnswerRevealResponse
    correctOrderingAnswer(ActivityQuestionSnapshot snapshot) {
        if (snapshot.type() != e_learning.server.question.enums.QuestionType.ORDERING) return null;
        return orderingRuntimeService.reveal(snapshot);
    }

    private void complete(ActivitySession session) {
        session.setStatus(ActivitySessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setScore(score(session));
    }

    private BigDecimal score(ActivitySession session) {
        return BigDecimal.valueOf(session.getFinalCorrectCount() * 100.0 / session.getTotalQuestions())
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void abandon(ActivitySession session) {
        session.setStatus(ActivitySessionStatus.ABANDONED);
        session.setCompletedAt(LocalDateTime.now());
    }

    private void settleXpIfTerminal(ActivitySession session) {
        boolean xpEligible = session.getXpPolicyVersion() != null
                || session.getXpLevelSnapshot() != null
                || session.getXpMultiplier() != null;
        if (xpEligible) {
            if (session.getStatus() == ActivitySessionStatus.ABANDONED) {
                activityXpRewardWorkflow.forfeitAbandonedSession(session.getId());
            } else if (session.getStatus() == ActivitySessionStatus.COMPLETED
                    || session.getStatus() == ActivitySessionStatus.GAME_OVER) {
                activityXpRewardWorkflow.finalizeTerminalSession(session.getId());
            }
        }
        // Streak requires completion, not eligibility for the separate XP rollout.
        if (session.getStatus() == ActivitySessionStatus.COMPLETED) {
            studentStreakService.recordCompletedActivity(session.getStudent().getId());
        }
    }

    private ActivitySession ownSession(Long id, Long studentId) {
        ActivitySession session = sessionRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_NOT_FOUND));
        if (!session.getStudent().getId().equals(studentId)) throw new AppException(ErrorCode.FORBIDDEN);
        return session;
    }

    private ActivitySession ownSessionForUpdate(Long id, Long studentId) {
        ActivitySession session = sessionRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_NOT_FOUND));
        if (!session.getStudent().getId().equals(studentId)) throw new AppException(ErrorCode.FORBIDDEN);
        return session;
    }

    private ActivitySessionQuestion question(Long sessionId, Long questionId) {
        return sessionQuestionRepository.findByIdAndSessionId(questionId, sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_QUESTION_NOT_FOUND));
    }

    private boolean hasCurrentGradeAccess(Long studentId, Long gradeId) {
        return classMemberRepository.findActiveMembershipByUserId(studentId)
                .map(member -> member.getClassEntity().getGrade().getId().equals(gradeId))
                .orElse(false);
    }

    private void requireCurrentGradeAccess(ActivitySession session, Long studentId) {
        if (!hasCurrentGradeAccess(studentId, session.getActivity().getUnit().getGrade().getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACCESSIBLE);
        }
    }

    private void requireActive(ActivitySession session) {
        if (session.getStatus() != ActivitySessionStatus.IN_PROGRESS)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACTIVE);
    }

    private void requireGuidedFinalAvailable(ActivitySessionQuestion item) {
        if (!guidedRuntimeService.isGuided(item) || guidedRuntimeService.finalAvailable(item)) return;
        if (item.getQuestion().getType() == e_learning.server.question.enums.QuestionType.ORDERING) {
            throw new AppException(ErrorCode.ORDERING_FINAL_NOT_AVAILABLE);
        }
        throw new AppException(ErrorCode.GUIDED_STEP_OUT_OF_ORDER);
    }

    private ActivitySessionResponse toResponse(ActivitySession session) {
        return new ActivitySessionResponse(session.getId(), session.getStatus(), session.getMode(), session.getSelectionStrategy(),
                session.getStartedAt(), session.getCompletedAt(), session.getTotalQuestions(), session.getFirstCorrectCount(),
                session.getFinalCorrectCount(), session.getHintUsedCount(), session.getScore(), session.getLives(),
                session.getQuestions().stream().map(this::toQuestionResponse).toList(),
                OffsetDateTime.now());
    }

    private ActivitySessionQuestionResponse toQuestionResponse(ActivitySessionQuestion item) {
        ActivityQuestionSnapshot snapshot = snapshotAssembler.read(item);
        if (guidedRuntimeService.isGuided(item) && !guidedRuntimeService.finalAvailable(item)) {
            return new ActivitySessionQuestionResponse(item.getId(), item.getPosition(), null, null, List.of(),
                    null, false, 0, null, null, false, false, null,
                    guidedRuntimeService.publicView(item), null);
        }
        List<ActivitySessionQuestionResponse.Option> options = snapshot.options().stream()
                .map(o -> new ActivitySessionQuestionResponse.Option(o.key(), o.content())).toList();
        return new ActivitySessionQuestionResponse(item.getId(), item.getPosition(), snapshot.type(),
                snapshot.content(), options,
                item.getDeadlineAt() == null ? null :
                        item.getDeadlineAt().atZone(ZoneId.systemDefault()).toOffsetDateTime(),
                item.isResolved(), item.getAnswerAttempts(), item.getFirstCorrect(),
                item.getFinalCorrect(), item.isHintUsed(),
                snapshot.hint() != null && !snapshot.hint().isBlank(), item.getResolutionReason(),
                guidedRuntimeService.isGuided(item) ? guidedRuntimeService.publicView(item) : null,
                snapshot.type() == e_learning.server.question.enums.QuestionType.ORDERING
                        ? orderingRuntimeService.publicView(snapshot.ordering()) : null);
    }
}
