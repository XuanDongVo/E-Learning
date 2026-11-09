package e_learning.server.assignmentanalysis.service;

import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignmentanalysis.dto.response.TeacherAssignmentSummaryResponse;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.user.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TeacherAssignmentSummaryServiceTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 9, 10, 0);

    @Test
    void aggregatesOpenFinalizedAndOverdueDeliveriesWithoutDoubleCountingStudents() {
        Assignment open = assignment(
                1L,
                AssignmentStatus.PUBLISHED,
                NOW.minusDays(1),
                NOW.plusDays(1),
                List.of(10L));
        Assignment due = assignment(
                2L,
                AssignmentStatus.PUBLISHED,
                NOW.minusDays(2),
                NOW.minusMinutes(1),
                List.of(10L, 20L));
        Assignment draft = assignment(
                3L,
                AssignmentStatus.DRAFT,
                NOW.minusDays(1),
                NOW.plusDays(1),
                List.of(10L));

        User first = user(101L);
        User second = user(102L);
        User third = user(103L);
        List<ClassMember> members = List.of(
                member(10L, first),
                member(10L, second),
                member(20L, first),
                member(20L, third));
        List<AssessmentAttempt> attempts = List.of(
                attempt(open, first, AssessmentAttemptStatus.SUBMITTED),
                attempt(open, second, AssessmentAttemptStatus.IN_PROGRESS),
                attempt(due, first, AssessmentAttemptStatus.TIMED_OUT));

        TeacherAssignmentSummaryResponse result = TeacherAssignmentSummaryService.summarize(
                List.of(open, due, draft), members, attempts, NOW);

        assertEquals(1, result.openAssignmentCount());
        assertEquals(2, result.finalizedDeliveryCount());
        assertEquals(2, result.overdueIncompleteDeliveryCount());
        assertEquals(3, result.dueDeliveryCount());
        assertEquals(1, result.finalizedDueDeliveryCount());
        assertEquals(1.0 / 3.0, result.resultRate(), 0.000001);
    }

    @Test
    void treatsTheExactDueTimeAsDueAndReturnsNullRateWithoutDueDeliveries() {
        Assignment dueNow = assignment(
                1L,
                AssignmentStatus.PUBLISHED,
                NOW.minusHours(1),
                NOW,
                List.of(10L));
        User student = user(101L);

        TeacherAssignmentSummaryResponse dueResult = TeacherAssignmentSummaryService.summarize(
                List.of(dueNow),
                List.of(member(10L, student)),
                List.of(),
                NOW);
        TeacherAssignmentSummaryResponse emptyResult = TeacherAssignmentSummaryService.summarize(
                List.of(), List.of(), List.of(), NOW);

        assertEquals(0, dueResult.openAssignmentCount());
        assertEquals(1, dueResult.dueDeliveryCount());
        assertEquals(1, dueResult.overdueIncompleteDeliveryCount());
        assertEquals(0.0, dueResult.resultRate());
        assertNull(emptyResult.resultRate());
    }

    private Assignment assignment(
            Long id,
            AssignmentStatus status,
            LocalDateTime startAt,
            LocalDateTime dueAt,
            List<Long> classIds) {
        Assignment assignment = mock(Assignment.class);
        when(assignment.getId()).thenReturn(id);
        when(assignment.getStatus()).thenReturn(status);
        when(assignment.getStartAt()).thenReturn(startAt);
        when(assignment.getDueAt()).thenReturn(dueAt);
        when(assignment.getClassIds()).thenReturn(classIds);
        return assignment;
    }

    private ClassMember member(Long classId, User user) {
        ClassEntity classEntity = mock(ClassEntity.class);
        when(classEntity.getId()).thenReturn(classId);
        ClassMember member = mock(ClassMember.class);
        when(member.getClassEntity()).thenReturn(classEntity);
        when(member.getUser()).thenReturn(user);
        return member;
    }

    private User user(Long id) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        return user;
    }

    private AssessmentAttempt attempt(
            Assignment assignment,
            User student,
            AssessmentAttemptStatus status) {
        AssessmentAttempt attempt = mock(AssessmentAttempt.class);
        when(attempt.getAssignment()).thenReturn(assignment);
        when(attempt.getStudent()).thenReturn(student);
        when(attempt.getStatus()).thenReturn(status);
        return attempt;
    }
}
