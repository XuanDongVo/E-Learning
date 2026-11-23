package e_learning.server.studyplanner.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.studyplanner.dto.StudyTaskCompletionRequest;
import e_learning.server.studyplanner.dto.StudyTaskUpsertRequest;
import e_learning.server.studyplanner.entity.StudentStudyTask;
import e_learning.server.studyplanner.repository.StudentStudyTaskRepository;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StudentStudyPlannerServiceTest {
    private final StudentStudyTaskRepository tasks = mock(StudentStudyTaskRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final StudentStudyPlannerService service = new StudentStudyPlannerService(tasks, users);

    @Test
    void listIsScopedToAuthenticatedStudent() {
        when(tasks.findByStudentIdOrderByCompletedAscPlannedDateAscCreatedAtDesc(7L))
                .thenReturn(List.of());
        assertTrue(service.list(7L).isEmpty());
        verify(tasks).findByStudentIdOrderByCompletedAscPlannedDateAscCreatedAtDesc(7L);
        verifyNoMoreInteractions(tasks);
    }

    @Test
    void createTrimsInputAndUsesAuthenticatedOwner() {
        User user = mock(User.class);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(tasks.saveAndFlush(any(StudentStudyTask.class))).thenAnswer(call -> {
            StudentStudyTask task = call.getArgument(0);
            task.setId(42L);
            task.setCreatedAt(LocalDateTime.of(2026, 11, 23, 10, 0));
            task.setUpdatedAt(LocalDateTime.of(2026, 11, 23, 10, 0));
            return task;
        });

        var created = service.create(7L, new StudyTaskUpsertRequest(
                "  Review irregular verbs  ", "  15 minutes  ", LocalDate.of(2026, 11, 25)));
        ArgumentCaptor<StudentStudyTask> captured = ArgumentCaptor.forClass(StudentStudyTask.class);
        verify(tasks).saveAndFlush(captured.capture());
        assertSame(user, captured.getValue().getStudent());
        assertEquals("Review irregular verbs", created.title());
        assertEquals("15 minutes", created.notes());
        assertEquals(LocalDate.of(2026, 11, 25), created.plannedDate());
        assertFalse(created.completed());
    }

    @Test
    void cannotUpdateOrDeleteAnotherStudentsTask() {
        when(tasks.findByIdAndStudentId(55L, 7L)).thenReturn(Optional.empty());
        var exception = assertThrows(AppException.class,
                () -> service.update(7L, 55L, new StudyTaskUpsertRequest("Study", null, null)));
        assertEquals(ErrorCode.STUDY_TASK_NOT_FOUND, exception.getErrorCode());
        assertThrows(AppException.class, () -> service.delete(7L, 55L));
        assertThrows(AppException.class,
                () -> service.setCompletion(7L, 55L, new StudyTaskCompletionRequest(true)));
        verify(tasks, never()).delete(any(StudentStudyTask.class));
        verify(tasks, never()).saveAndFlush(any(StudentStudyTask.class));
    }

    @Test
    void completionCanBeUndoneWithoutLosingTaskContent() {
        StudentStudyTask task = new StudentStudyTask();
        task.setId(8L);
        task.setTitle("Read grammar notes");
        task.setNotes("Page 12");
        when(tasks.findByIdAndStudentId(8L, 7L)).thenReturn(Optional.of(task));
        when(tasks.saveAndFlush(task)).thenReturn(task);

        var done = service.setCompletion(7L, 8L, new StudyTaskCompletionRequest(true));
        assertTrue(done.completed());
        assertNotNull(done.completedAt());

        var same = service.setCompletion(7L, 8L, new StudyTaskCompletionRequest(true));
        assertEquals(done.completedAt(), same.completedAt());

        var reopened = service.setCompletion(7L, 8L, new StudyTaskCompletionRequest(false));
        assertFalse(reopened.completed());
        assertNull(reopened.completedAt());
        assertEquals("Read grammar notes", reopened.title());
        assertEquals("Page 12", reopened.notes());
    }
}
