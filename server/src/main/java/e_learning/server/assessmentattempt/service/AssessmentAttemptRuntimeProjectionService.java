package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.response.AttemptRuntimeQuestionResponse;
import e_learning.server.assessmentattempt.dto.response.AttemptRuntimeResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswer;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptAnswerRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.entity.ClassStatus;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssessmentAttemptRuntimeProjectionService {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptQuestionRepository questionRepository;
    private final AssessmentAttemptAnswerRepository answerRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;

    @Transactional(readOnly = true)
    public Optional<AttemptRuntimeResponse> findForStartOrResume(Long assignmentId, Long studentId, UUID sessionId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        requireActiveStudent(studentId);

        Optional<AssessmentAttempt> existing = attemptRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
        if (existing.isPresent()) {
            AssessmentAttempt attempt = existing.get();
            if (attempt.getStatus() == AssessmentAttemptStatus.SUBMITTED) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_ALREADY_SUBMITTED);
            }
            if (attempt.getStatus() == AssessmentAttemptStatus.TIMED_OUT) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_ALREADY_TIMED_OUT);
            }
            if (attempt.getActiveSessionId() == null) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_SESSION_LOST);
            }
            if (!attempt.getActiveSessionId().equals(sessionId)) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_SESSION_CONFLICT);
            }
            if (!LocalDateTime.now().isBefore(attempt.getDeadlineAt())) {
                // Timeout finalization/auto-submit is a later slice. Never extend the deadline on resume.
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_TIME_UP);
            }
            // Existing Attempts use their immutable class/content snapshot. A later class transfer or
            // operationally archiving the Assignment must not silently rewrite historical attribution.
            return Optional.of(toResponse(attempt, assignment));
        }

        validatePublished(assignment);
        ClassMember membership = classMemberRepository.findActiveMembershipByUserId(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS));
        if (membership.getClassEntity().getStatus() != ClassStatus.ACTIVE) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS);
        }
        Long classId = membership.getClassEntity().getId();
        if (assignment.getClassIds() == null ||
                assignment.getClassIds().stream().noneMatch(id -> Objects.equals(id, classId))) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }
        return Optional.empty();
    }

    @Transactional(readOnly = true)
    public AttemptRuntimeResponse getRuntime(Long attemptId) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND));
        Assignment assignment = assignmentRepository.findById(attempt.getAssignment().getId())
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        return toResponse(attempt, assignment);
    }

    private AttemptRuntimeResponse toResponse(AssessmentAttempt attempt, Assignment assignment) {
        LocalDateTime now = LocalDateTime.now();
        Object titleValue = attempt.getDocumentSnapshot().get("assignmentTitle");
        String title = titleValue instanceof String text ? text : assignment.getName();
        Object dueAtValue = attempt.getSettingsSnapshot().get("due_at");
        LocalDateTime dueAt = dueAtValue instanceof String text
                ? LocalDateTime.parse(text) : assignment.getDueAt();
        List<AttemptRuntimeQuestionResponse> questions =
                questionRepository.findAllByAttemptIdOrderByPositionAsc(attempt.getId())
                        .stream().map(this::toQuestionResponse).toList();
        boolean late = attempt.getStatus() == AssessmentAttemptStatus.IN_PROGRESS
                ? !now.isBefore(dueAt) : attempt.isLate();

        return new AttemptRuntimeResponse(
                attempt.getId(), assignment.getId(), title, attempt.getStatus(),
                attempt.getStartedAt(), attempt.getDeadlineAt(), now, attempt.getTimeLimitMinutes(),
                attempt.getClassIdAtStart(), attempt.getClassNameAtStart(), late,
                attempt.getSnapshotVersion(), attempt.getDocumentSnapshot(), attempt.getSettingsSnapshot(), questions);
    }

    private AttemptRuntimeQuestionResponse toQuestionResponse(AssessmentAttemptQuestion question) {
        Map<String, Object> snapshot = question.getQuestionSnapshot();
        Map<String, Object> studentData = toMap(snapshot.get("student"));
        // The persisted grading object is deliberately not copied into the student response.
        Map<String, Object> safeSnapshot = new LinkedHashMap<>();
        safeSnapshot.put("spec", toMap(studentData.get("spec")));

        Optional<AssessmentAttemptAnswer> answer = answerRepository.findByAttemptQuestionId(question.getId());
        return new AttemptRuntimeQuestionResponse(
                question.getId(),
                question.getAssignmentItem() == null ? null : question.getAssignmentItem().getId(),
                question.getSourceQuestion() == null ? null : question.getSourceQuestion().getId(),
                question.getSectionKey(), question.getSectionTitle(), question.getPosition(), safeSnapshot,
                question.getPossiblePoints(), question.isExample(),
                answer.map(AssessmentAttemptAnswer::getAnswerPayload).orElseGet(Map::of),
                answer.map(AssessmentAttemptAnswer::getRevision).orElse(0L));
    }

    private Map<String, Object> toMap(Object value) {
        if (!(value instanceof Map<?, ?> map)) return Map.of();
        Map<String, Object> result = new LinkedHashMap<>();
        map.forEach((key, item) -> { if (key instanceof String text) result.put(text, item); });
        return result;
    }

    private void validatePublished(Assignment assignment) {
        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }
    }

    private void requireActiveStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        if (student.getRole() != Role.STUDENT || student.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }
}
