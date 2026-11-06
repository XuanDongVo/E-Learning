package e_learning.server.gamification.service;

import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import e_learning.server.activitysession.snapshot.ActivityQuestionSnapshotAssembler;
import e_learning.server.gamification.config.ActivityXpProperties;
import e_learning.server.gamification.dto.ActivityXpPolicySnapshot;
import e_learning.server.gamification.dto.ActivityXpQuestionEvaluation;
import e_learning.server.gamification.entity.StudentGamificationProfile;
import e_learning.server.gamification.repository.StudentGamificationProfileRepository;
import e_learning.server.question.engine.exception.QuestionEngineException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Phase 2 boundary for immutable policy capture and per-question XP audit.
 * It does not finalize rewards, write the XP ledger or mutate Lifetime XP.
 */
@Service
@RequiredArgsConstructor
public class ActivityXpSessionAuditService {
    public static final String POLICY_VERSION = "ACTIVITY_XP_V2_2";

    private final ActivityXpProperties properties;
    private final StudentGamificationProfileRepository profileRepository;
    private final ActivityXpCalculator calculator;
    private final ActivityQuestionSnapshotAssembler snapshotAssembler;

    /**
     * Captures policy only for newly eligible sessions. The caller serializes
     * concurrent starts for the student before invoking this method.
     */
    public Optional<ActivityXpPolicySnapshot> captureStartSnapshot(
            long studentId, List<ActivityQuestionSnapshot> questionSnapshots) {
        if (!properties.isEnabled()) {
            return Optional.empty();
        }
        if (studentId <= 0) {
            throw new IllegalArgumentException("studentId must be positive");
        }
        if (questionSnapshots == null || questionSnapshots.isEmpty()) {
            throw new QuestionEngineException("An XP-eligible ActivitySession requires selected questions");
        }
        questionSnapshots.forEach(snapshotAssembler::requireXpEligible);

        StudentGamificationProfile profile = profileRepository.findWithLockByStudentId(studentId)
                .orElseGet(() -> createAndLockProfile(studentId));
        int level = profile.getCurrentLevel();
        return Optional.of(new ActivityXpPolicySnapshot(
                level, POLICY_VERSION, calculator.levelMultiplier(level)));
    }

    public void applyStartSnapshot(ActivitySession session, ActivityXpPolicySnapshot snapshot) {
        if (session == null || snapshot == null) {
            throw new IllegalArgumentException("session and snapshot must not be null");
        }
        if (session.getXpLevelSnapshot() != null
                || session.getXpPolicyVersion() != null
                || session.getXpMultiplier() != null) {
            throw new QuestionEngineException("Activity XP policy snapshot is already captured");
        }
        requireSupportedPolicySnapshot(snapshot.level(), snapshot.policyVersion(), snapshot.multiplier());
        session.setXpLevelSnapshot(snapshot.level());
        session.setXpPolicyVersion(snapshot.policyVersion());
        session.setXpMultiplier(snapshot.multiplier());
    }

    /**
     * Persists one immutable audit evaluation for a newly resolved question.
     * Legacy/ineligible sessions with no policy snapshot remain untouched.
     */
    public void auditResolvedQuestion(
            ActivitySessionQuestion item, ActivityQuestionSnapshot questionSnapshot) {
        if (item == null || questionSnapshot == null) {
            throw new IllegalArgumentException("item and questionSnapshot must not be null");
        }
        ActivitySession session = item.getSession();
        if (session == null) {
            throw new QuestionEngineException("ActivitySessionQuestion is not attached to a session");
        }
        if (isLegacyOrIneligible(session)) {
            return;
        }
        requireCompletePolicySnapshot(session);
        if (!item.isResolved()) {
            throw new QuestionEngineException("XP audit requires a resolved ActivitySessionQuestion");
        }
        if (item.getXpResolvedAt() != null) {
            requireCompleteQuestionAudit(item);
            return;
        }
        if (item.getXpOutcome() != null || item.getXpBase() != null || item.getXpFinal() != null) {
            throw new QuestionEngineException("Activity question has a partial XP audit");
        }

        snapshotAssembler.requireXpEligible(questionSnapshot);
        var outcome = calculator.mapResolvedOutcome(
                session.getMode(), item.getResolutionReason(), item.getAnswerAttempts(),
                item.isHintUsed(), item.getFinalCorrect());
        ActivityXpQuestionEvaluation evaluation = calculator.evaluateQuestion(
                requirePersistedQuestionId(item), questionSnapshot.difficulty(), outcome,
                session.getXpMultiplier());

        item.setXpOutcome(evaluation.outcome());
        item.setXpBase(evaluation.baseXp());
        item.setXpFinal(evaluation.finalXp());
        item.setXpResolvedAt(LocalDateTime.now());
    }

    private StudentGamificationProfile createAndLockProfile(long studentId) {
        profileRepository.insertIfAbsent(studentId);
        return profileRepository.findWithLockByStudentId(studentId)
                .orElseThrow(() -> new QuestionEngineException(
                        "Unable to create or load StudentGamificationProfile"));
    }

    private static boolean isLegacyOrIneligible(ActivitySession session) {
        return session.getXpLevelSnapshot() == null
                && session.getXpPolicyVersion() == null
                && session.getXpMultiplier() == null;
    }

    private void requireCompletePolicySnapshot(ActivitySession session) {
        if (session.getXpLevelSnapshot() == null || session.getXpMultiplier() == null) {
            throw new QuestionEngineException("ActivitySession has an invalid XP policy snapshot");
        }
        requireSupportedPolicySnapshot(
                session.getXpLevelSnapshot(), session.getXpPolicyVersion(), session.getXpMultiplier());
    }

    private void requireSupportedPolicySnapshot(
            int level, String policyVersion, BigDecimal multiplier) {
        if (!POLICY_VERSION.equals(policyVersion)
                || level < 1
                || multiplier == null
                || calculator.levelMultiplier(level).compareTo(multiplier) != 0) {
            throw new QuestionEngineException("ActivitySession has an invalid XP policy snapshot");
        }
    }

    private static void requireCompleteQuestionAudit(ActivitySessionQuestion item) {
        if (item.getXpOutcome() == null || item.getXpBase() == null || item.getXpFinal() == null) {
            throw new QuestionEngineException("Activity question has an incomplete persisted XP audit");
        }
    }

    private static long requirePersistedQuestionId(ActivitySessionQuestion item) {
        if (item.getId() == null || item.getId() <= 0) {
            throw new QuestionEngineException("XP audit requires a persisted ActivitySessionQuestion");
        }
        return item.getId();
    }
}
