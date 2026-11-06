package e_learning.server.gamification.service;

import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.activitysession.repository.ActivitySessionRepository;
import e_learning.server.activitysession.snapshot.ActivityQuestionSnapshotAssembler;
import e_learning.server.gamification.dto.ActivityXpPreview;
import e_learning.server.gamification.dto.ActivityXpQuestionEvaluation;
import e_learning.server.gamification.dto.ActivityXpRewardReceipt;
import e_learning.server.gamification.entity.StudentGamificationProfile;
import e_learning.server.gamification.entity.XpSourceType;
import e_learning.server.gamification.entity.XpTransaction;
import e_learning.server.gamification.repository.StudentGamificationProfileRepository;
import e_learning.server.gamification.repository.XpTransactionRepository;
import e_learning.server.question.engine.exception.QuestionEngineException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Serializes terminal Activity XP settlement in Session -> Profile lock order.
 * The session aggregate, ledger row and profile update share one transaction.
 */
@Service
@RequiredArgsConstructor
public class ActivityXpRewardWorkflowImpl implements ActivityXpRewardWorkflow {
    private static final String IDEMPOTENCY_PREFIX = "ACTIVITY_SESSION_REWARD:";

    private final ActivitySessionRepository sessionRepository;
    private final StudentGamificationProfileRepository profileRepository;
    private final XpTransactionRepository transactionRepository;
    private final ActivityXpCalculator calculator;
    private final ActivityQuestionSnapshotAssembler snapshotAssembler;

    @Override
    @Transactional(readOnly = true)
    public ActivityXpPreview preview(long sessionId) {
        ActivitySession session = findSession(sessionId);
        if (isLegacyOrIneligible(session)) {
            return new ActivityXpPreview(session.getId(), 0, List.of());
        }
        requirePolicySnapshot(session);
        List<ActivityXpQuestionEvaluation> evaluations = validatedResolvedEvaluations(session);
        return new ActivityXpPreview(
                session.getId(), sumFinalXp(evaluations), List.copyOf(evaluations));
    }

    @Override
    @Transactional
    public ActivityXpRewardReceipt finalizeTerminalSession(long sessionId) {
        ActivitySession session = lockSession(sessionId);
        if (session.getXpFinalizedAt() != null) {
            return receipt(session);
        }
        requireEligible(session);
        if (session.getStatus() != ActivitySessionStatus.COMPLETED
                && session.getStatus() != ActivitySessionStatus.GAME_OVER) {
            throw new QuestionEngineException(
                    "Activity XP can only be awarded for COMPLETED or GAME_OVER sessions");
        }

        List<ActivityXpQuestionEvaluation> evaluations = validatedResolvedEvaluations(session);
        if (session.getStatus() == ActivitySessionStatus.COMPLETED
                && (session.getQuestions().size() != session.getTotalQuestions()
                || session.getQuestions().stream().anyMatch(question -> !question.isResolved()))) {
            throw new QuestionEngineException(
                    "A COMPLETED ActivitySession must have every selected question resolved");
        }

        int questionXp = sumFinalXp(evaluations);
        int completionBonus = calculator.completionBonus(
                session.getTotalQuestions(), session.getStatus(), session.getXpMultiplier());
        int committedXp = addExact(questionXp, completionBonus);
        StudentGamificationProfile profile = lockProfile(session.getStudent().getId());
        long lifetimeAfter = addExact(profile.getLifetimeXp(), committedXp);
        int levelAfter = calculator.levelForLifetimeXp(lifetimeAfter);
        LocalDateTime finalizedAt = LocalDateTime.now();

        if (committedXp > 0) {
            persistLedgerEntry(session, committedXp, finalizedAt);
            profile.setLifetimeXp(lifetimeAfter);
            profile.setCurrentLevel(levelAfter);
        }
        persistReceipt(
                session, questionXp, completionBonus, committedXp,
                lifetimeAfter, levelAfter, finalizedAt);
        return receipt(session);
    }

    @Override
    @Transactional
    public ActivityXpRewardReceipt finalizeZeroAward(long sessionId) {
        ActivityXpRewardReceipt receipt = finalizeTerminalSession(sessionId);
        if (receipt.committedXp() != 0) {
            throw new QuestionEngineException("ActivitySession has a positive XP reward");
        }
        return receipt;
    }

    @Override
    @Transactional
    public void forfeitAbandonedSession(long sessionId) {
        ActivitySession session = lockSession(sessionId);
        if (session.getXpFinalizedAt() != null) {
            receipt(session);
            return;
        }
        requireEligible(session);
        if (session.getStatus() != ActivitySessionStatus.ABANDONED) {
            throw new QuestionEngineException(
                    "Activity XP can only be forfeited for an ABANDONED session");
        }
        // Validate any audit rows that were written before the early exit, but
        // never transfer provisional XP for an abandoned session.
        validatedResolvedEvaluations(session);
        StudentGamificationProfile profile = lockProfile(session.getStudent().getId());
        persistReceipt(
                session, 0, 0, 0,
                profile.getLifetimeXp(), profile.getCurrentLevel(), LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ActivityXpRewardReceipt> findFinalizedReward(long sessionId) {
        ActivitySession session = findSession(sessionId);
        return session.getXpFinalizedAt() == null
                ? Optional.empty()
                : Optional.of(receipt(session));
    }

    private List<ActivityXpQuestionEvaluation> validatedResolvedEvaluations(ActivitySession session) {
        List<ActivityXpQuestionEvaluation> evaluations = new ArrayList<>();
        for (ActivitySessionQuestion item : session.getQuestions()) {
            if (!item.isResolved()) {
                requireNoQuestionAudit(item);
                continue;
            }
            requireCompleteQuestionAudit(item);
            ActivityQuestionSnapshot snapshot = snapshotAssembler.read(item);
            snapshotAssembler.requireXpEligible(snapshot);
            var expectedOutcome = calculator.mapResolvedOutcome(
                    session.getMode(), item.getResolutionReason(), item.getAnswerAttempts(),
                    item.isHintUsed(), item.getFinalCorrect());
            ActivityXpQuestionEvaluation expected = calculator.evaluateQuestion(
                    item.getId(), snapshot.difficulty(), expectedOutcome, session.getXpMultiplier());
            if (item.getXpOutcome() != expected.outcome()
                    || item.getXpBase() != expected.baseXp()
                    || item.getXpFinal() != expected.finalXp()) {
                throw new QuestionEngineException(
                        "Persisted Activity question XP audit does not match the frozen policy");
            }
            evaluations.add(new ActivityXpQuestionEvaluation(
                    item.getId(), expected.difficulty(), expected.outcome(),
                    expected.baseXp(), expected.finalXp(), item.getXpResolvedAt()));
        }
        return evaluations;
    }

    private void persistLedgerEntry(
            ActivitySession session, int committedXp, LocalDateTime finalizedAt) {
        String idempotencyKey = IDEMPOTENCY_PREFIX + session.getId();
        if (transactionRepository.findByIdempotencyKey(idempotencyKey).isPresent()
                || transactionRepository.findBySourceTypeAndActivitySessionId(
                        XpSourceType.PRACTICE, session.getId()).isPresent()) {
            throw new QuestionEngineException(
                    "ActivitySession has a ledger entry without a finalized reward receipt");
        }
        XpTransaction transaction = new XpTransaction(
                session.getStudent().getId(), XpSourceType.PRACTICE,
                session.getId(), committedXp, idempotencyKey);
        transaction.setActivitySessionId(session.getId());
        transaction.setPolicyVersion(session.getXpPolicyVersion());
        transaction.setLevelSnapshot(session.getXpLevelSnapshot());
        transaction.setXpMultiplier(session.getXpMultiplier());
        transaction.setEarnedAt(finalizedAt);
        transaction.setNote("Activity XP v2.2 terminal reward");
        transactionRepository.save(transaction);
    }

    private static void persistReceipt(
            ActivitySession session,
            int questionXp,
            int completionBonus,
            int committedXp,
            long lifetimeAfter,
            int levelAfter,
            LocalDateTime finalizedAt) {
        session.setXpQuestionTotal(questionXp);
        session.setXpCompletionBonus(completionBonus);
        session.setXpTotal(committedXp);
        session.setXpLifetimeAfter(lifetimeAfter);
        session.setXpLevelAfter(levelAfter);
        session.setXpFinalizedAt(finalizedAt);
    }

    private ActivityXpRewardReceipt receipt(ActivitySession session) {
        if (session.getXpFinalizedAt() == null
                || session.getXpQuestionTotal() == null
                || session.getXpCompletionBonus() == null
                || session.getXpTotal() == null
                || session.getXpLevelSnapshot() == null
                || session.getXpLifetimeAfter() == null
                || session.getXpLevelAfter() == null) {
            throw new QuestionEngineException("ActivitySession has an incomplete XP reward receipt");
        }
        return new ActivityXpRewardReceipt(
                session.getId(), session.getStatus(), session.getXpQuestionTotal(),
                session.getXpCompletionBonus(), session.getXpTotal(),
                session.getXpLevelSnapshot(), session.getXpLifetimeAfter(),
                session.getXpLevelAfter(), session.getXpFinalizedAt());
    }

    private void requireEligible(ActivitySession session) {
        if (isLegacyOrIneligible(session)) {
            throw new QuestionEngineException(
                    "Legacy or rollout-disabled ActivitySession is not eligible for XP");
        }
        requirePolicySnapshot(session);
    }

    private void requirePolicySnapshot(ActivitySession session) {
        if (!ActivityXpSessionAuditService.POLICY_VERSION.equals(session.getXpPolicyVersion())
                || session.getXpLevelSnapshot() == null
                || session.getXpLevelSnapshot() < 1
                || session.getXpMultiplier() == null
                || calculator.levelMultiplier(session.getXpLevelSnapshot())
                .compareTo(session.getXpMultiplier()) != 0) {
            throw new QuestionEngineException("ActivitySession has an invalid XP policy snapshot");
        }
    }

    private StudentGamificationProfile lockProfile(long studentId) {
        return profileRepository.findWithLockByStudentId(studentId)
                .orElseThrow(() -> new QuestionEngineException(
                        "StudentGamificationProfile is missing for an XP-eligible ActivitySession"));
    }

    private ActivitySession lockSession(long sessionId) {
        if (sessionId <= 0) {
            throw new IllegalArgumentException("sessionId must be positive");
        }
        return sessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new QuestionEngineException("ActivitySession was not found"));
    }

    private ActivitySession findSession(long sessionId) {
        if (sessionId <= 0) {
            throw new IllegalArgumentException("sessionId must be positive");
        }
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new QuestionEngineException("ActivitySession was not found"));
    }

    private static boolean isLegacyOrIneligible(ActivitySession session) {
        return session.getXpLevelSnapshot() == null
                && session.getXpPolicyVersion() == null
                && session.getXpMultiplier() == null;
    }

    private static void requireCompleteQuestionAudit(ActivitySessionQuestion item) {
        if (item.getXpOutcome() == null
                || item.getXpBase() == null
                || item.getXpFinal() == null
                || item.getXpResolvedAt() == null) {
            throw new QuestionEngineException(
                    "Resolved Activity question has an incomplete XP audit");
        }
    }

    private static void requireNoQuestionAudit(ActivitySessionQuestion item) {
        if (item.getXpOutcome() != null
                || item.getXpBase() != null
                || item.getXpFinal() != null
                || item.getXpResolvedAt() != null) {
            throw new QuestionEngineException(
                    "Unresolved Activity question must not have an XP audit");
        }
    }

    private static int sumFinalXp(List<ActivityXpQuestionEvaluation> evaluations) {
        int total = 0;
        try {
            for (ActivityXpQuestionEvaluation evaluation : evaluations) {
                total = Math.addExact(total, evaluation.finalXp());
            }
            return total;
        } catch (ArithmeticException exception) {
            throw new QuestionEngineException("Activity question XP total overflow");
        }
    }

    private static int addExact(int left, int right) {
        try {
            return Math.addExact(left, right);
        } catch (ArithmeticException exception) {
            throw new QuestionEngineException("Activity XP total overflow");
        }
    }

    private static long addExact(long lifetimeXp, int committedXp) {
        try {
            return Math.addExact(lifetimeXp, committedXp);
        } catch (ArithmeticException exception) {
            throw new QuestionEngineException("Lifetime XP overflow");
        }
    }
}
