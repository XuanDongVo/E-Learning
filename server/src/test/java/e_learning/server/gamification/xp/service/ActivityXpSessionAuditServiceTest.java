package e_learning.server.gamification.xp.service;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.activitysession.entity.ActivityQuestionResolution;
import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import e_learning.server.activitysession.snapshot.ActivityQuestionSnapshotAssembler;
import e_learning.server.gamification.xp.config.ActivityXpProperties;
import e_learning.server.gamification.profile.entity.StudentGamificationProfile;
import e_learning.server.gamification.xp.entity.XpQuestionOutcome;
import e_learning.server.gamification.profile.repository.StudentGamificationProfileRepository;
import e_learning.server.question.engine.exception.QuestionEngineException;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityXpSessionAuditServiceTest {
    @Mock private StudentGamificationProfileRepository profileRepository;
    @Mock private ActivityQuestionSnapshotAssembler snapshotAssembler;

    private ActivityXpProperties properties;
    private ActivityXpSessionAuditService service;

    @BeforeEach
    void setUp() {
        properties = new ActivityXpProperties();
        service = new ActivityXpSessionAuditService(
                properties, profileRepository, new ActivityXpCalculatorImpl(), snapshotAssembler);
    }

    @Test
    void disabledRolloutDoesNotBindPolicyOrCreateProfile() {
        Optional<?> snapshot = service.captureStartSnapshot(20L, List.of(snapshot(Difficulty.EASY)));

        assertFalse(snapshot.isPresent());
        verifyNoInteractions(profileRepository, snapshotAssembler);
    }

    @Test
    void capturesOfficialLevelMultiplierAndPolicyFromExistingProfile() {
        properties.setEnabled(true);
        StudentGamificationProfile profile = new StudentGamificationProfile(20L);
        profile.setCurrentLevel(6);
        when(profileRepository.findWithLockByStudentId(20L)).thenReturn(Optional.of(profile));

        var captured = service.captureStartSnapshot(20L, List.of(snapshot(Difficulty.HARD))).orElseThrow();

        assertEquals(6, captured.level());
        assertEquals(ActivityXpSessionAuditService.POLICY_VERSION, captured.policyVersion());
        assertEquals(new BigDecimal("0.90"), captured.multiplier());
        verify(profileRepository, never()).insertIfAbsent(20L);
    }

    @Test
    void createsMissingProfileWithConflictSafeInsertThenLocksIt() {
        properties.setEnabled(true);
        StudentGamificationProfile profile = new StudentGamificationProfile(20L);
        when(profileRepository.findWithLockByStudentId(20L))
                .thenReturn(Optional.empty(), Optional.of(profile));

        var captured = service.captureStartSnapshot(20L, List.of(snapshot(Difficulty.EASY))).orElseThrow();

        assertEquals(1, captured.level());
        assertEquals(new BigDecimal("1.00"), captured.multiplier());
        verify(profileRepository).insertIfAbsent(20L);
    }

    @Test
    void appliesPolicySnapshotExactlyOnce() {
        ActivitySession session = session(ActivityMode.LEARNING, new BigDecimal("1.00"));
        session.setXpLevelSnapshot(null);
        session.setXpPolicyVersion(null);
        session.setXpMultiplier(null);
        var snapshot = new e_learning.server.gamification.xp.dto.ActivityXpPolicySnapshot(
                11, ActivityXpSessionAuditService.POLICY_VERSION, new BigDecimal("0.80"));

        service.applyStartSnapshot(session, snapshot);

        assertEquals(11, session.getXpLevelSnapshot());
        assertEquals(ActivityXpSessionAuditService.POLICY_VERSION, session.getXpPolicyVersion());
        assertEquals(new BigDecimal("0.80"), session.getXpMultiplier());
        assertThrows(QuestionEngineException.class, () -> service.applyStartSnapshot(session, snapshot));
    }

    @Test
    void auditsUsingFrozenQuestionDifficultyAndSessionMultiplier() {
        ActivitySession session = session(ActivityMode.LEARNING, new BigDecimal("0.90"));
        session.setXpLevelSnapshot(6);
        ActivityQuestionSnapshot frozen = snapshot(Difficulty.EASY);
        Question mutableQuestion = mock(Question.class);
        ActivitySessionQuestion item = resolvedQuestion(
                session, mutableQuestion, frozen, ActivityQuestionResolution.CORRECT, 1, false, true);

        service.auditResolvedQuestion(item, frozen);

        assertEquals(XpQuestionOutcome.CORRECT_FIRST_TRY, item.getXpOutcome());
        assertEquals(8, item.getXpBase());
        assertEquals(7, item.getXpFinal());
        assertNotNull(item.getXpResolvedAt());
        verify(mutableQuestion, never()).getDifficulty();
    }

    @Test
    void hintStillPrecedesRetryInPersistedAudit() {
        ActivitySession session = session(ActivityMode.LEARNING, new BigDecimal("1.00"));
        ActivityQuestionSnapshot frozen = snapshot(Difficulty.MEDIUM);
        ActivitySessionQuestion item = resolvedQuestion(
                session, mock(Question.class), frozen,
                ActivityQuestionResolution.CORRECT, 2, true, true);

        service.auditResolvedQuestion(item, frozen);

        assertEquals(XpQuestionOutcome.CORRECT_WITH_HINT, item.getXpOutcome());
        assertEquals(5, item.getXpBase());
        assertEquals(5, item.getXpFinal());
    }

    @Test
    void timeoutPersistsAZeroXpAudit() {
        ActivitySession session = session(ActivityMode.TRY_HARD, new BigDecimal("1.00"));
        ActivityQuestionSnapshot frozen = snapshot(Difficulty.HARD);
        ActivitySessionQuestion item = resolvedQuestion(
                session, mock(Question.class), frozen,
                ActivityQuestionResolution.TIMEOUT, 0, false, false);

        service.auditResolvedQuestion(item, frozen);

        assertEquals(XpQuestionOutcome.TIMEOUT, item.getXpOutcome());
        assertEquals(0, item.getXpBase());
        assertEquals(0, item.getXpFinal());
        assertNotNull(item.getXpResolvedAt());
    }

    @Test
    void duplicateAuditKeepsTheFirstPersistedBreakdown() {
        ActivitySession session = session(ActivityMode.LEARNING, new BigDecimal("1.00"));
        ActivityQuestionSnapshot frozen = snapshot(Difficulty.HARD);
        ActivitySessionQuestion item = resolvedQuestion(
                session, mock(Question.class), frozen,
                ActivityQuestionResolution.CORRECT, 1, false, true);

        service.auditResolvedQuestion(item, frozen);
        LocalDateTime firstResolvedAt = item.getXpResolvedAt();
        service.auditResolvedQuestion(item, frozen);

        assertEquals(12, item.getXpFinal());
        assertEquals(firstResolvedAt, item.getXpResolvedAt());
    }

    @Test
    void legacySessionWithoutPolicyIsNeverRetroactivelyAudited() {
        ActivitySession session = session(ActivityMode.LEARNING, new BigDecimal("1.00"));
        session.setXpLevelSnapshot(null);
        session.setXpPolicyVersion(null);
        session.setXpMultiplier(null);
        ActivityQuestionSnapshot legacy = new ActivityQuestionSnapshot(
                1, 1L, QuestionType.SINGLE_CHOICE, null,
                "Legacy", null, null, null, List.of(), List.of(), "{}");
        ActivitySessionQuestion item = resolvedQuestion(
                session, mock(Question.class), legacy,
                ActivityQuestionResolution.CORRECT, 1, false, true);

        service.auditResolvedQuestion(item, legacy);

        assertNull(item.getXpOutcome());
        assertNull(item.getXpBase());
        assertNull(item.getXpFinal());
        assertNull(item.getXpResolvedAt());
        verifyNoInteractions(snapshotAssembler);
    }

    @Test
    void rejectsPartialPolicyOrQuestionAuditInsteadOfRepricing() {
        ActivitySession partialPolicy = session(ActivityMode.LEARNING, new BigDecimal("1.00"));
        partialPolicy.setXpMultiplier(null);
        ActivityQuestionSnapshot frozen = snapshot(Difficulty.EASY);
        ActivitySessionQuestion policyItem = resolvedQuestion(
                partialPolicy, mock(Question.class), frozen,
                ActivityQuestionResolution.CORRECT, 1, false, true);
        assertThrows(QuestionEngineException.class,
                () -> service.auditResolvedQuestion(policyItem, frozen));

        ActivitySession inconsistentPolicy = session(ActivityMode.LEARNING, new BigDecimal("0.90"));
        ActivitySessionQuestion inconsistentItem = resolvedQuestion(
                inconsistentPolicy, mock(Question.class), frozen,
                ActivityQuestionResolution.CORRECT, 1, false, true);
        assertThrows(QuestionEngineException.class,
                () -> service.auditResolvedQuestion(inconsistentItem, frozen));

        ActivitySession validSession = session(ActivityMode.LEARNING, new BigDecimal("1.00"));
        ActivitySessionQuestion partialItem = resolvedQuestion(
                validSession, mock(Question.class), frozen,
                ActivityQuestionResolution.CORRECT, 1, false, true);
        partialItem.setXpBase(8);
        assertThrows(QuestionEngineException.class,
                () -> service.auditResolvedQuestion(partialItem, frozen));
    }

    private static ActivitySession session(ActivityMode mode, BigDecimal multiplier) {
        ActivitySession session = new ActivitySession(
                mock(User.class), mock(Activity.class), mode,
                SelectionStrategy.RANDOM, 1, mode == ActivityMode.TRY_HARD ? 3 : null, null);
        session.setXpLevelSnapshot(1);
        session.setXpPolicyVersion(ActivityXpSessionAuditService.POLICY_VERSION);
        session.setXpMultiplier(multiplier);
        return session;
    }

    private static ActivitySessionQuestion resolvedQuestion(
            ActivitySession session,
            Question question,
            ActivityQuestionSnapshot snapshot,
            ActivityQuestionResolution resolution,
            int attempts,
            boolean hintUsed,
            boolean finalCorrect) {
        ActivitySessionQuestion item = new ActivitySessionQuestion(question, 0, snapshot);
        item.setId(100L);
        item.setAnswerAttempts(attempts);
        item.setHintUsed(hintUsed);
        item.setFinalCorrect(finalCorrect);
        item.setResolved(true);
        item.setResolutionReason(resolution);
        session.addQuestion(item);
        return item;
    }

    private static ActivityQuestionSnapshot snapshot(Difficulty difficulty) {
        return new ActivityQuestionSnapshot(
                ActivityQuestionSnapshotAssembler.SNAPSHOT_SCHEMA_VERSION,
                1L,
                QuestionType.SINGLE_CHOICE,
                difficulty,
                "Question",
                null,
                "Hint",
                null,
                List.of(),
                List.of(),
                "{}");
    }
}
