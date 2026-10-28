package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.student.StudentAssignmentItemResponse;
import e_learning.server.assignment.dto.student.StudentAssignmentStatus;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentAssignmentService {

    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentItemRepository assignmentItemRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;

    /**
     * Return published assignments targeted to the student's active class.
     * The optional status and q filters are applied to this authorized set.
     */
    public List<StudentAssignmentItemResponse> getMyAssignments(
            Long studentId,
            String statusFilter,
            String query
    ) {
        User student = userRepository.findById(studentId)
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ClassMember membership = classMemberRepository.findActiveMembershipByUserId(student.getId())
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS));

        Long activeClassId = membership.getClassEntity().getId();
        LocalDateTime now = LocalDateTime.now();
        StudentAssignmentStatus requestedStatus;
        try {
            requestedStatus = StudentAssignmentStatus.fromFilter(statusFilter);
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String normalizedQuery = normalizeQuery(query);

        return assignmentRepository.findAllByStatusOrderByDueAtAscIdAsc(AssignmentStatus.PUBLISHED)
                .stream()
                .filter(assignment -> isVisibleToClass(assignment, activeClassId))
                .filter(assignment -> assignment.getStartAt() == null || !assignment.getStartAt().isAfter(now))
                .filter(assignment -> matchesQuery(assignment, normalizedQuery))
                .map(assignment -> toResponse(assignment, studentId, now))
                .filter(item -> requestedStatus == null || item.status() == requestedStatus)
                .sorted(Comparator.comparing(StudentAssignmentItemResponse::dueAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private boolean isVisibleToClass(Assignment assignment, Long activeClassId) {
        return assignment.getClassIds() != null && assignment.getClassIds().contains(activeClassId);
    }

    private boolean matchesQuery(Assignment assignment, String query) {
        if (query == null) {
            return true;
        }

        return containsIgnoreCase(assignment.getName(), query)
                || containsIgnoreCase(assignment.getDescription(), query);
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return query.trim().toLowerCase(Locale.ROOT);
    }

    private StudentAssignmentItemResponse toResponse(
            Assignment assignment,
            Long studentId,
            LocalDateTime now
    ) {
        AssessmentAttempt attempt = assessmentAttemptRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), studentId)
                .orElse(null);

        StudentAssignmentStatus status = resolveStatus(assignment, attempt, now);
        long questionCount = assignmentItemRepository
                .countByAssignmentIdAndItemType(assignment.getId(), "QUESTION");

        int dueInDays = Math.toIntExact(ChronoUnit.DAYS.between(now.toLocalDate(), assignment.getDueAt().toLocalDate()));
        String dueLabel = formatDueLabel(dueInDays);

        return new StudentAssignmentItemResponse(
                assignment.getId(),
                assignment.getName(),
                dueInDays,
                assignment.getDueAt(),
                questionCount,
                assignment.getTimeLimitMinutes(),
                status,
                assignment.getDescription(),
                dueLabel
        );
    }

    private String formatDueLabel(int dueInDays) {
        if (dueInDays < 0) {
            int overdueDays = Math.abs(dueInDays);
            return overdueDays == 1 ? "Overdue by 1 day" : "Overdue by " + overdueDays + " days";
        }
        if (dueInDays == 0) {
            return "Due today";
        }
        return dueInDays == 1 ? "Due in 1 day" : "Due in " + dueInDays + " days";
    }

    private StudentAssignmentStatus resolveStatus(
            Assignment assignment,
            AssessmentAttempt attempt,
            LocalDateTime now
    ) {
        if (attempt != null
                && (attempt.getStatus() == AssessmentAttemptStatus.SUBMITTED
                || attempt.getStatus() == AssessmentAttemptStatus.TIMED_OUT)) {
            return StudentAssignmentStatus.COMPLETED;
        }

        if (assignment.getDueAt() != null && assignment.getDueAt().isBefore(now)) {
            return StudentAssignmentStatus.LATE;
        }

        // The existing frontend groups an in-progress attempt under "todo".
        return StudentAssignmentStatus.TODO;
    }
}
