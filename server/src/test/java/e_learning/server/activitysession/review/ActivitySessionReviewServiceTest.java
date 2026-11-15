package e_learning.server.activitysession.review;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.activitysession.entity.*;
import e_learning.server.activitysession.dto.response.ActivitySessionReviewResponse;
import e_learning.server.activitysession.enums.GuidedQuestionStage;
import e_learning.server.activitysession.enums.QuestionDeliveryType;
import e_learning.server.activitysession.guided.GuidedRuntimeSnapshot;
import e_learning.server.activitysession.repository.*;
import e_learning.server.activitysession.snapshot.ActivityQuestionSnapshotAssembler;
import e_learning.server.common.exception.AppException;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.guided.*;
import e_learning.server.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ActivitySessionReviewServiceTest {
    private final ActivitySessionRepository sessionRepository = mock(ActivitySessionRepository.class);
    private final ActivitySessionGuidedStepAttemptRepository stepAttemptRepository =
            mock(ActivitySessionGuidedStepAttemptRepository.class);
    private final ActivitySessionGuidedStepHintRepository stepHintRepository =
            mock(ActivitySessionGuidedStepHintRepository.class);
    private final ActivitySessionFinalAnswerAttemptRepository finalAttemptRepository =
            mock(ActivitySessionFinalAnswerAttemptRepository.class);
    private final ActivityQuestionSnapshotAssembler snapshotAssembler =
            mock(ActivityQuestionSnapshotAssembler.class);
    private final ObjectMapper objectMapper = mock(ObjectMapper.class);
    private ActivitySessionReviewService service;

    @BeforeEach
    void setUp() {
        service = new ActivitySessionReviewService(
                sessionRepository, stepAttemptRepository, stepHintRepository,
                finalAttemptRepository, snapshotAssembler, objectMapper);
    }

    @Test
    void rejectsReviewForAnotherStudent() {
        ActivitySession session = session(false);
        when(sessionRepository.findById(10L)).thenReturn(Optional.of(session));

        assertThrows(AppException.class, () -> service.studentReview(10L, 999L));
        verifyNoInteractions(stepAttemptRepository, stepHintRepository, finalAttemptRepository);
    }

    @Test
    void resolvedGuidedQuestionReturnsPersistedStepsFinalAttemptsAndAnswerKeys() throws Exception {
        ActivitySession session = session(true);
        ActivitySessionQuestion item = session.getQuestions().getFirst();
        GuidedRuntimeSnapshot guided = guidedSnapshot();
        ActivityQuestionSnapshot questionSnapshot = questionSnapshot();
        when(sessionRepository.findById(10L)).thenReturn(Optional.of(session));
        when(snapshotAssembler.read(item)).thenReturn(questionSnapshot);
        when(objectMapper.readValue("guided", GuidedRuntimeSnapshot.class)).thenReturn(guided);
        when(stepHintRepository.findAllBySessionQuestionId(101L)).thenReturn(List.of());
        when(stepAttemptRepository.findAllBySessionQuestionIdOrderByAttemptNumberAsc(101L))
                .thenReturn(List.of(new ActivitySessionGuidedStepAttempt(
                        item, "step-1", 1, java.util.UUID.randomUUID(),
                        "\"B\"", true, false, true, GuidedQuestionStage.STEP_ACTIVE)));
        when(finalAttemptRepository.findAllBySessionQuestionIdOrderByAttemptNumberAsc(101L))
                .thenReturn(List.of(new ActivitySessionFinalAnswerAttempt(
                        item, 1, java.util.UUID.randomUUID(), "\"A\"",
                        true, false, true, false)));

        var response = service.studentReview(10L, 20L);
        var question = response.questions().getFirst();

        assertEquals(2, question.guided().steps().size());
        assertEquals(List.of("B"), question.guided().steps().getFirst().correctAnswers());
        assertEquals(List.of("A"), question.finalAnswer().correctAnswers());
        assertEquals(ActivitySessionReviewResponse.HistoryState.AVAILABLE,
                question.finalAnswer().historyState());
    }

    @Test
    void unfinishedGuidedQuestionHidesFutureStepFinalPromptAndAnswerKeys() throws Exception {
        ActivitySession session = session(false);
        ActivitySessionQuestion item = session.getQuestions().getFirst();
        when(sessionRepository.findById(10L)).thenReturn(Optional.of(session));
        when(snapshotAssembler.read(item)).thenReturn(questionSnapshot());
        when(objectMapper.readValue("guided", GuidedRuntimeSnapshot.class)).thenReturn(guidedSnapshot());
        when(stepHintRepository.findAllBySessionQuestionId(101L)).thenReturn(List.of());
        when(stepAttemptRepository.findAllBySessionQuestionIdOrderByAttemptNumberAsc(101L)).thenReturn(List.of());
        when(finalAttemptRepository.findAllBySessionQuestionIdOrderByAttemptNumberAsc(101L)).thenReturn(List.of());

        var question = service.studentReview(10L, 20L).questions().getFirst();

        assertEquals(1, question.guided().steps().size());
        assertTrue(question.guided().steps().getFirst().correctAnswers().isEmpty());
        assertNull(question.prompt());
        assertTrue(question.finalAnswer().correctAnswers().isEmpty());
    }

    @Test
    void legacyFinalAttemptIsReportedUnavailableWithoutInventingAnAnswer() throws Exception {
        ActivitySession session = session(true);
        ActivitySessionQuestion item = session.getQuestions().getFirst();
        item.setAnswerAttempts(1);
        when(sessionRepository.findById(10L)).thenReturn(Optional.of(session));
        when(snapshotAssembler.read(item)).thenReturn(questionSnapshot());
        when(objectMapper.readValue("guided", GuidedRuntimeSnapshot.class)).thenReturn(guidedSnapshot());
        when(stepHintRepository.findAllBySessionQuestionId(101L)).thenReturn(List.of());
        when(stepAttemptRepository.findAllBySessionQuestionIdOrderByAttemptNumberAsc(101L)).thenReturn(List.of());
        when(finalAttemptRepository.findAllBySessionQuestionIdOrderByAttemptNumberAsc(101L)).thenReturn(List.of());

        var finalReview = service.studentReview(10L, 20L)
                .questions().getFirst().finalAnswer();

        assertEquals(ActivitySessionReviewResponse.HistoryState.LEGACY_UNAVAILABLE,
                finalReview.historyState());
        assertTrue(finalReview.attempts().isEmpty());
    }

    private ActivitySession session(boolean resolved) {
        User student = mock(User.class);
        when(student.getId()).thenReturn(20L);
        Unit unit = mock(Unit.class);
        when(unit.getId()).thenReturn(30L);
        when(unit.getCode()).thenReturn("U1");
        when(unit.getName()).thenReturn("Grammar");
        Activity activity = mock(Activity.class);
        when(activity.getId()).thenReturn(40L);
        when(activity.getName()).thenReturn("Guided practice");
        when(activity.getUnit()).thenReturn(unit);
        ActivitySession session = new ActivitySession(
                student, activity, ActivityMode.LEARNING,
                SelectionStrategy.RANDOM, 1, null, null);
        session.setId(10L);
        ActivitySessionQuestion item = new ActivitySessionQuestion(
                mock(Question.class), 0, questionSnapshot());
        item.setId(101L);
        item.setDeliveryType(QuestionDeliveryType.GUIDED_REASONING);
        item.setResolved(resolved);
        item.setFinalCorrect(resolved ? Boolean.TRUE : null);
        ActivitySessionGuidedProgress progress = new ActivitySessionGuidedProgress(1, "guided");
        progress.setStage(resolved ? GuidedQuestionStage.QUESTION_RESOLVED : GuidedQuestionStage.STEP_ACTIVE);
        progress.setCurrentStepIndex(0);
        item.attachGuidedProgress(progress);
        session.addQuestion(item);
        return session;
    }

    private ActivityQuestionSnapshot questionSnapshot() {
        return new ActivityQuestionSnapshot(
                2, 1L, QuestionType.SINGLE_CHOICE, Difficulty.EASY,
                "Final prompt", "Final explanation", null, null,
                List.of(
                        new ActivityQuestionSnapshot.Option("A", "Answer", true),
                        new ActivityQuestionSnapshot.Option("B", "Other", false)),
                List.of(), "snapshot");
    }

    private GuidedRuntimeSnapshot guidedSnapshot() {
        GuidedStepPayload first = new GuidedStepPayload(
                "step-1", 0, QuestionType.SINGLE_CHOICE, "First step",
                List.of(new GuidedChoicePayload("A", "No"), new GuidedChoicePayload("B", "Yes")),
                "B", null, List.of(), null, "Step explanation", false, null, false);
        GuidedStepPayload second = new GuidedStepPayload(
                "step-2", 1, QuestionType.TRUE_FALSE, "Future step",
                List.of(), null, true, List.of(), null, null, false, null, false);
        return new GuidedRuntimeSnapshot(1, new GuidedDefinitionPayload("Intro", List.of(first, second)));
    }
}
