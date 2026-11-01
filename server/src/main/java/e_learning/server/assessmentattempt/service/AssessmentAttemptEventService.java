package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.AttemptEventRequest;
import e_learning.server.assessmentattempt.dto.response.CreateAttemptEventResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptEvent;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptEventType;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptEventRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Records client soft signals (tab hidden / fullscreen exit).
 * Events are the source of truth for leave counts; no denormalized column in MVP.
 */
@Service
@RequiredArgsConstructor
public class AssessmentAttemptEventService {
    private static final Set<AssessmentAttemptEventType> CLIENT_SIGNAL_TYPES =
            EnumSet.of(
                    AssessmentAttemptEventType.TAB_HIDDEN,
                    AssessmentAttemptEventType.FULLSCREEN_EXIT
            );

    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptEventRepository eventRepository;

    @Transactional
    public CreateAttemptEventResponse recordClientSignal(
            Long attemptId,
            Long studentId,
            AttemptEventRequest request
    ) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND));

        verifyStudentOwnership(attempt, studentId);
        verifyActiveSession(attempt, request.activeSessionId());
        validateWritable(attempt);
        validateClientSignalType(request.eventType());

        LocalDateTime now = LocalDateTime.now();

        AssessmentAttemptEvent event = new AssessmentAttemptEvent();
        event.setAttempt(attempt);
        event.setEventType(request.eventType());
        event.setOccurredAt(now);
        event.setActiveSessionId(request.activeSessionId());
        event.setMetadata(Map.of("source", "client"));
        eventRepository.save(event);

        attempt.setLastActivityAt(now);

        long leaveEventCount = eventRepository.countByAttemptIdAndEventTypeIn(
                attemptId,
                CLIENT_SIGNAL_TYPES
        );

        return new CreateAttemptEventResponse(
                event.getId(),
                event.getEventType(),
                event.getOccurredAt(),
                leaveEventCount
        );
    }

    private void verifyStudentOwnership(AssessmentAttempt attempt, Long studentId) {
        if (attempt.getStudent() == null || !attempt.getStudent().getId().equals(studentId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_ACCESS_DENIED);
        }
    }

    private void verifyActiveSession(AssessmentAttempt attempt, UUID activeSessionId) {
        if (attempt.getActiveSessionId() == null || !attempt.getActiveSessionId().equals(activeSessionId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_SESSION_LOST);
        }
    }

    private void validateWritable(AssessmentAttempt attempt) {
        if (attempt.getStatus() != AssessmentAttemptStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_STATE);
        }
    }

    private void validateClientSignalType(AssessmentAttemptEventType eventType) {
        if (eventType == null || !CLIENT_SIGNAL_TYPES.contains(eventType)) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
}
