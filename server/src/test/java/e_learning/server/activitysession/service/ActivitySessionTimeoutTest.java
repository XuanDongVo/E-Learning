package e_learning.server.activitysession.service;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.ActivityStatus;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.activity.dto.response.ActivityReadinessResponse;
import e_learning.server.activity.repository.ActivityRepository;
import e_learning.server.activity.service.ActivityReadinessService;
import e_learning.server.activitysession.dto.ActivitySessionAnswerRequest;
import e_learning.server.activitysession.entity.ActivityQuestionResolution;
import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.activitysession.repository.ActivitySessionQuestionRepository;
import e_learning.server.activitysession.repository.ActivitySessionRepository;
import e_learning.server.activitysession.selection.ActivityQuestionSelectionService;
import e_learning.server.activitysession.snapshot.ActivityQuestionSnapshotAssembler;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.grades.entity.Grade;
import e_learning.server.gamification.service.ActivityXpSessionAuditService;
import e_learning.server.gamification.dto.ActivityXpPolicySnapshot;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivitySessionTimeoutTest {
    private static final long SESSION_ID = 10L;
    private static final long STUDENT_ID = 20L;

    @Mock private ActivityRepository activityRepository;
    @Mock private ActivityReadinessService readinessService;
    @Mock private ActivitySessionRepository sessionRepository;
    @Mock private ActivitySessionQuestionRepository sessionQuestionRepository;
    @Mock private ClassMemberRepository classMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private QuestionOptionRepository optionRepository;
    @Mock private QuestionAnswerRepository answerRepository;
    @Mock private ActivityQuestionSnapshotAssembler snapshotAssembler;
    @Mock private ActivityQuestionSelectionService questionSelectionService;
    @Mock private ActivityXpSessionAuditService activityXpAuditService;
    @InjectMocks private ActivitySessionService service;

    private record Fixture(ActivitySession session, ActivitySessionQuestion first,
                           ActivitySessionQuestion second) {}

    private Fixture fixture(int totalQuestions, int lives) {
        User student = mock(User.class);
        when(student.getId()).thenReturn(STUDENT_ID);
        Grade grade = mock(Grade.class);
        when(grade.getId()).thenReturn(6L);
        Unit unit = mock(Unit.class);
        when(unit.getGrade()).thenReturn(grade);
        Activity activity = mock(Activity.class);
        when(activity.getUnit()).thenReturn(unit);
        ClassEntity clazz = mock(ClassEntity.class);
        when(clazz.getGrade()).thenReturn(grade);
        ClassMember member = mock(ClassMember.class);
        when(member.getClassEntity()).thenReturn(clazz);
        when(classMemberRepository.findActiveMembershipByUserId(STUDENT_ID))
                .thenReturn(Optional.of(member));

        ActivitySession session = new ActivitySession(student, activity, ActivityMode.TRY_HARD,
                SelectionStrategy.RANDOM, totalQuestions, lives, 30);
        session.setId(SESSION_ID);
        ActivityQuestionSnapshot snapshot = new ActivityQuestionSnapshot(
                2, 1L, QuestionType.SINGLE_CHOICE, Difficulty.EASY,
                "Select one", null, null, null, List.of(), List.of(), "{}");
        lenient().when(snapshotAssembler.read(any(ActivitySessionQuestion.class))).thenReturn(snapshot);
        ActivitySessionQuestion first = new ActivitySessionQuestion(mock(Question.class), 0, snapshot);
        first.setId(101L);
        session.addQuestion(first);
        ActivitySessionQuestion second = null;
        if (totalQuestions == 2) {
            second = new ActivitySessionQuestion(mock(Question.class), 1, snapshot);
            second.setId(102L);
            session.addQuestion(second);
            lenient().when(sessionQuestionRepository.findByIdAndSessionId(102L, SESSION_ID))
                    .thenReturn(Optional.of(second));
        }
        lenient().when(sessionQuestionRepository.findByIdAndSessionId(101L, SESSION_ID))
                .thenReturn(Optional.of(first));
        when(sessionRepository.findByIdForUpdate(SESSION_ID)).thenReturn(Optional.of(session));
        return new Fixture(session, first, second);
    }

    @Test
    void doesNotResolveBeforeDeadlineAndNetworkGrace() {
        Fixture f = fixture(1, 2);
        f.first().setServedAt(LocalDateTime.now().minusSeconds(30));
        f.first().setDeadlineAt(LocalDateTime.now().minusSeconds(1));

        var state = service.timeout(SESSION_ID, 101L, STUDENT_ID);

        assertEquals(ActivitySessionStatus.IN_PROGRESS, state.status());
        assertFalse(f.first().isResolved());
        assertEquals(2, state.lives());
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void expiredTimeoutResolvesWithoutDeductingLifeAndStartsNextDeadline() {
        Fixture f = fixture(2, 2);
        f.first().setServedAt(LocalDateTime.now().minusMinutes(1));
        f.first().setDeadlineAt(LocalDateTime.now().minusSeconds(8));

        var state = service.timeout(SESSION_ID, 101L, STUDENT_ID);

        assertEquals(ActivitySessionStatus.IN_PROGRESS, state.status());
        assertEquals(ActivityQuestionResolution.TIMEOUT, f.first().getResolutionReason());
        assertTrue(f.first().isResolved());
        assertEquals(0, f.first().getAnswerAttempts());
        assertEquals(2, f.session().getLives());
        assertNotNull(f.second().getDeadlineAt(), "next timer must start server-side");
        assertNotNull(state.serverNow());
        assertNotNull(state.questions().get(1).deadlineAt());
        assertNotNull(state.questions().get(1).deadlineAt().getOffset());
        verify(sessionRepository).save(f.session());
    }

    @Test
    void timeoutOfLastQuestionCompletesSessionAndIsRetrySafe() {
        Fixture f = fixture(1, 1);
        f.first().setServedAt(LocalDateTime.now().minusMinutes(1));
        f.first().setDeadlineAt(LocalDateTime.now().minusSeconds(8));

        var initial = service.timeout(SESSION_ID, 101L, STUDENT_ID);
        var replay = service.timeout(SESSION_ID, 101L, STUDENT_ID);

        assertEquals(ActivitySessionStatus.COMPLETED, initial.status());
        assertEquals(initial.status(), replay.status());
        assertEquals(1, f.session().getLives());
        assertEquals(ActivityQuestionResolution.TIMEOUT, f.first().getResolutionReason());
        verify(sessionRepository, times(1)).save(f.session());
    }

    @Test
    void futureTryHardQuestionCannotBeAnsweredOrTimedOut() {
        Fixture f = fixture(2, 2);
        f.first().setServedAt(LocalDateTime.now());
        f.first().setDeadlineAt(LocalDateTime.now().plusSeconds(30));

        assertThrows(AppException.class,
                () -> service.answer(SESSION_ID, 102L, STUDENT_ID, new ActivitySessionAnswerRequest(null)));
        assertThrows(AppException.class,
                () -> service.timeout(SESSION_ID, 102L, STUDENT_ID));
        assertFalse(f.second().isResolved());
        assertNull(f.second().getServedAt());
    }

    @Test
    void lateAnswerIsTimeoutAndDoesNotConsumeLifeOrCountAttempt() {
        Fixture f = fixture(1, 1);
        f.first().setServedAt(LocalDateTime.now().minusMinutes(1));
        f.first().setDeadlineAt(LocalDateTime.now().minusSeconds(8));

        var state = service.answer(SESSION_ID, 101L, STUDENT_ID, new ActivitySessionAnswerRequest(null));

        assertFalse(state.correct());
        assertEquals(ActivitySessionStatus.COMPLETED, state.session().status());
        assertEquals(ActivityQuestionResolution.TIMEOUT, f.first().getResolutionReason());
        assertEquals(1, f.session().getLives());
        assertEquals(0, f.first().getAnswerAttempts());
    }

    @Test
    void wrongAnswerStillCostsLifeAndEndsWithGameOver() {
        Fixture f = fixture(1, 1);
        f.first().setServedAt(LocalDateTime.now());
        f.first().setDeadlineAt(LocalDateTime.now().plusSeconds(30));

        service.answer(SESSION_ID, 101L, STUDENT_ID, new ActivitySessionAnswerRequest(null));

        assertEquals(ActivityQuestionResolution.WRONG, f.first().getResolutionReason());
        assertEquals(ActivitySessionStatus.GAME_OVER, f.session().getStatus());
        assertEquals(0, f.session().getLives());
    }

    @Test
    void learningRetryIsNotAuditedUntilResolvedAndHintUsesTheSessionLock() {
        User student = mock(User.class);
        when(student.getId()).thenReturn(STUDENT_ID);
        Grade grade = mock(Grade.class);
        when(grade.getId()).thenReturn(6L);
        Unit unit = mock(Unit.class);
        when(unit.getGrade()).thenReturn(grade);
        Activity activity = mock(Activity.class);
        when(activity.getUnit()).thenReturn(unit);
        ClassEntity clazz = mock(ClassEntity.class);
        when(clazz.getGrade()).thenReturn(grade);
        ClassMember member = mock(ClassMember.class);
        when(member.getClassEntity()).thenReturn(clazz);
        when(classMemberRepository.findActiveMembershipByUserId(STUDENT_ID))
                .thenReturn(Optional.of(member));

        ActivitySession session = new ActivitySession(
                student, activity, ActivityMode.LEARNING,
                SelectionStrategy.RANDOM, 1, null, null);
        session.setId(SESSION_ID);
        ActivityQuestionSnapshot snapshot = new ActivityQuestionSnapshot(
                2, 1L, QuestionType.SINGLE_CHOICE, Difficulty.EASY,
                "Select one", null, "Use the first option", null,
                List.of(new ActivityQuestionSnapshot.Option("A", "Answer", true)),
                List.of(), "{}");
        ActivitySessionQuestion item = new ActivitySessionQuestion(mock(Question.class), 0, snapshot);
        item.setId(101L);
        session.addQuestion(item);
        when(sessionRepository.findByIdForUpdate(SESSION_ID)).thenReturn(Optional.of(session));
        when(sessionQuestionRepository.findByIdAndSessionId(101L, SESSION_ID))
                .thenReturn(Optional.of(item));
        when(snapshotAssembler.read(item)).thenReturn(snapshot);

        var first = service.answer(
                SESSION_ID, 101L, STUDENT_ID, new ActivitySessionAnswerRequest(null));

        assertTrue(first.retryAvailable());
        assertFalse(item.isResolved());
        verify(activityXpAuditService, never()).auditResolvedQuestion(any(), any());

        service.hint(SESSION_ID, 101L, STUDENT_ID);
        assertTrue(item.isHintUsed());

        JsonNode correctAnswer = mock(JsonNode.class);
        when(correctAnswer.asText()).thenReturn("A");
        service.answer(
                SESSION_ID, 101L, STUDENT_ID, new ActivitySessionAnswerRequest(correctAnswer));

        assertTrue(item.isResolved());
        assertEquals(ActivityQuestionResolution.CORRECT, item.getResolutionReason());
        verify(activityXpAuditService).auditResolvedQuestion(item, snapshot);
        verify(sessionRepository, times(3)).findByIdForUpdate(SESSION_ID);
        verify(sessionRepository, never()).findById(SESSION_ID);
    }

    @Test
    void startLocksActiveSessionsBeforeCapturingAndApplyingXpPolicy() {
        long activityId = 30L;
        User student = mock(User.class);
        Grade grade = mock(Grade.class);
        when(grade.getId()).thenReturn(6L);
        Unit unit = mock(Unit.class);
        when(unit.getGrade()).thenReturn(grade);
        Activity activity = mock(Activity.class);
        when(activity.getStatus()).thenReturn(ActivityStatus.PUBLISHED);
        when(activity.getUnit()).thenReturn(unit);
        when(activity.getMode()).thenReturn(ActivityMode.LEARNING);
        when(activity.getAvailableSelectionStrategies()).thenReturn(List.of(SelectionStrategy.RANDOM));
        ActivityReadinessResponse readiness = mock(ActivityReadinessResponse.class);
        when(readiness.isReady()).thenReturn(true);
        when(readinessService.validateForPublish(activity)).thenReturn(readiness);
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));
        when(userRepository.findByIdForGamificationUpdate(STUDENT_ID)).thenReturn(Optional.of(student));

        ClassEntity clazz = mock(ClassEntity.class);
        when(clazz.getGrade()).thenReturn(grade);
        ClassMember member = mock(ClassMember.class);
        when(member.getClassEntity()).thenReturn(clazz);
        when(classMemberRepository.findActiveMembershipByUserId(STUDENT_ID))
                .thenReturn(Optional.of(member));

        Question question = mock(Question.class);
        ActivityQuestionSnapshot questionSnapshot = new ActivityQuestionSnapshot(
                2, 1L, QuestionType.SINGLE_CHOICE, Difficulty.EASY,
                "Question", null, null, null, List.of(), List.of(), "{}");
        when(questionSelectionService.selectQuestions(activity)).thenReturn(List.of(question));
        when(snapshotAssembler.assemble(question)).thenReturn(questionSnapshot);
        when(snapshotAssembler.read(any(ActivitySessionQuestion.class))).thenReturn(questionSnapshot);

        ActivitySession oldSession = new ActivitySession(
                student, activity, ActivityMode.LEARNING,
                SelectionStrategy.RANDOM, 1, null, null);
        oldSession.setId(9L);
        when(sessionRepository.findAllByStudentIdAndStatusInForUpdate(
                STUDENT_ID, List.of(ActivitySessionStatus.IN_PROGRESS)))
                .thenReturn(List.of(oldSession));
        ActivityXpPolicySnapshot policy = new ActivityXpPolicySnapshot(
                6, ActivityXpSessionAuditService.POLICY_VERSION, new BigDecimal("0.90"));
        when(activityXpAuditService.captureStartSnapshot(STUDENT_ID, List.of(questionSnapshot)))
                .thenReturn(Optional.of(policy));
        doAnswer(invocation -> {
            ActivitySession target = invocation.getArgument(0);
            target.setXpLevelSnapshot(policy.level());
            target.setXpPolicyVersion(policy.policyVersion());
            target.setXpMultiplier(policy.multiplier());
            return null;
        }).when(activityXpAuditService).applyStartSnapshot(any(ActivitySession.class), eq(policy));
        when(sessionRepository.save(any(ActivitySession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.start(activityId, STUDENT_ID, null);

        InOrder order = inOrder(userRepository, sessionRepository, activityXpAuditService);
        order.verify(userRepository).findByIdForGamificationUpdate(STUDENT_ID);
        order.verify(sessionRepository).findAllByStudentIdAndStatusInForUpdate(
                STUDENT_ID, List.of(ActivitySessionStatus.IN_PROGRESS));
        order.verify(activityXpAuditService).captureStartSnapshot(STUDENT_ID, List.of(questionSnapshot));
        order.verify(activityXpAuditService).applyStartSnapshot(any(ActivitySession.class), eq(policy));
        order.verify(sessionRepository).save(any(ActivitySession.class));
        assertEquals(ActivitySessionStatus.ABANDONED, oldSession.getStatus());
    }
}
