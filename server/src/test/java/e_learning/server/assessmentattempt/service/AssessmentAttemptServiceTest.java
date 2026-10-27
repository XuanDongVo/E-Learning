package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.StartOrResumeAttemptRequest;
import e_learning.server.assessmentattempt.dto.response.AttemptRuntimeResponse;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentAttemptServiceTest {
    @Mock private AssessmentAttemptRepository attemptRepository;
    @Mock private AssignmentRepository assignmentRepository;
    @Mock private AssignmentItemRepository assignmentItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private ClassMemberRepository classMemberRepository;
    @Mock private AssessmentAttemptCreationService creationService;
    @Mock private AssessmentAttemptRuntimeProjectionService runtimeProjectionService;

    @InjectMocks private AssessmentAttemptService service;

    @Test
    void resumesExistingAttemptWithoutCreatingAnother() {
        UUID credential = UUID.randomUUID();
        AttemptRuntimeResponse runtime = runtime(12L);
        when(runtimeProjectionService.findForStartOrResume(5L, 8L, credential))
                .thenReturn(Optional.of(runtime));

        assertSame(runtime, service.startOrResume(5L, 8L, new StartOrResumeAttemptRequest(credential)));
        verifyNoInteractions(creationService);
    }

    @Test
    void createsAttemptWhenNoneExists() {
        UUID credential = UUID.randomUUID();
        AttemptRuntimeResponse runtime = runtime(12L);
        when(runtimeProjectionService.findForStartOrResume(5L, 8L, credential))
                .thenReturn(Optional.empty());
        when(creationService.createAttempt(5L, 8L, credential)).thenReturn(12L);
        when(runtimeProjectionService.getRuntime(12L)).thenReturn(runtime);

        assertSame(runtime, service.startOrResume(5L, 8L, new StartOrResumeAttemptRequest(credential)));
        verify(creationService).createAttempt(5L, 8L, credential);
    }

    @Test
    void recoversOnlyTheNamedUniqueConstraintRace() {
        UUID credential = UUID.randomUUID();
        AttemptRuntimeResponse runtime = runtime(12L);
        when(runtimeProjectionService.findForStartOrResume(5L, 8L, credential))
                .thenReturn(Optional.empty(), Optional.of(runtime));
        when(creationService.createAttempt(5L, 8L, credential))
                .thenThrow(new DataIntegrityViolationException("duplicate attempt",
                        new SQLException("duplicate key violates unique constraint " +
                                "\"uq_assessment_attempt_assignment_student\"", "23505")));

        assertSame(runtime, service.startOrResume(5L, 8L, new StartOrResumeAttemptRequest(credential)));
        verify(runtimeProjectionService, times(2)).findForStartOrResume(5L, 8L, credential);
    }

    @Test
    void doesNotMaskAnUnrelatedIntegrityFailure() {
        UUID credential = UUID.randomUUID();
        DataIntegrityViolationException failure = new DataIntegrityViolationException("other constraint");
        when(runtimeProjectionService.findForStartOrResume(5L, 8L, credential))
                .thenReturn(Optional.empty());
        when(creationService.createAttempt(5L, 8L, credential)).thenThrow(failure);

        assertSame(failure, assertThrows(DataIntegrityViolationException.class,
                () -> service.startOrResume(5L, 8L, new StartOrResumeAttemptRequest(credential))));
        verify(runtimeProjectionService, times(1)).findForStartOrResume(5L, 8L, credential);
    }

    private AttemptRuntimeResponse runtime(Long attemptId) {
        LocalDateTime now = LocalDateTime.now();
        return new AttemptRuntimeResponse(attemptId, 5L, "Assignment",
                AssessmentAttemptStatus.IN_PROGRESS, now, now.plusMinutes(30), now, 30,
                4L, "Class 6A", false, 1, Map.of(), Map.of(), List.of());
    }
}
