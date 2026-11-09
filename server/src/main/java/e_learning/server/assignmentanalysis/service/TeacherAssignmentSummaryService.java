package e_learning.server.assignmentanalysis.service;

import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assignmentanalysis.dto.response.TeacherAssignmentSummaryResponse;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeacherAssignmentSummaryService {

    private final AssignmentRepository assignmentRepository;
    private final ClassMemberRepository classMemberRepository;
    private final AssessmentAttemptRepository attemptRepository;

    @Transactional(readOnly = true)
    public TeacherAssignmentSummaryResponse getSummary(Long teacherId) {
        List<Assignment> publishedAssignments = assignmentRepository
                .findAllVisibleToTeacherExcludingArchived(teacherId)
                .stream()
                .filter(assignment -> assignment.getStatus() == AssignmentStatus.PUBLISHED)
                .toList();

        if (publishedAssignments.isEmpty()) {
            return emptySummary();
        }

        Set<Long> classIds = new HashSet<>();
        for (Assignment assignment : publishedAssignments) {
            if (assignment.getClassIds() != null) {
                classIds.addAll(assignment.getClassIds());
            }
        }

        List<ClassMember> members = classIds.isEmpty()
                ? List.of()
                : classMemberRepository.findActiveStudentsByTeacherIdAndClassIdIn(
                        teacherId, classIds);
        List<Long> assignmentIds = publishedAssignments.stream()
                .map(Assignment::getId)
                .toList();
        List<AssessmentAttempt> attempts = attemptRepository
                .findAllByAssignmentIdInWithStudent(assignmentIds);

        return summarize(publishedAssignments, members, attempts, LocalDateTime.now());
    }

    static TeacherAssignmentSummaryResponse summarize(
            List<Assignment> assignments,
            List<ClassMember> members,
            List<AssessmentAttempt> attempts,
            LocalDateTime now) {
        Map<Long, Set<Long>> studentIdsByClass = new HashMap<>();
        for (ClassMember member : members) {
            if (member.getClassEntity() == null || member.getUser() == null) {
                continue;
            }
            studentIdsByClass
                    .computeIfAbsent(member.getClassEntity().getId(), ignored -> new HashSet<>())
                    .add(member.getUser().getId());
        }

        Map<DeliveryKey, AssessmentAttemptStatus> attemptStatusByDelivery = new HashMap<>();
        for (AssessmentAttempt attempt : attempts) {
            if (attempt.getAssignment() == null || attempt.getStudent() == null) {
                continue;
            }
            attemptStatusByDelivery.put(
                    new DeliveryKey(attempt.getAssignment().getId(), attempt.getStudent().getId()),
                    attempt.getStatus());
        }

        int openAssignments = 0;
        int finalizedDeliveries = 0;
        int overdueIncompleteDeliveries = 0;
        int dueDeliveries = 0;
        int finalizedDueDeliveries = 0;

        for (Assignment assignment : assignments) {
            if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
                continue;
            }

            boolean isOpen = (assignment.getStartAt() == null || !assignment.getStartAt().isAfter(now))
                    && assignment.getDueAt() != null
                    && assignment.getDueAt().isAfter(now);
            if (isOpen) {
                openAssignments++;
            }

            Set<Long> assignedStudentIds = new HashSet<>();
            if (assignment.getClassIds() != null) {
                for (Long classId : assignment.getClassIds()) {
                    assignedStudentIds.addAll(
                            studentIdsByClass.getOrDefault(classId, Set.of()));
                }
            }

            boolean isDue = assignment.getDueAt() != null
                    && !assignment.getDueAt().isAfter(now);
            for (Long studentId : assignedStudentIds) {
                AssessmentAttemptStatus status = attemptStatusByDelivery.get(
                        new DeliveryKey(assignment.getId(), studentId));
                boolean finalized = isFinalized(status);

                if (finalized) {
                    finalizedDeliveries++;
                }
                if (isDue) {
                    dueDeliveries++;
                    if (finalized) {
                        finalizedDueDeliveries++;
                    } else {
                        overdueIncompleteDeliveries++;
                    }
                }
            }
        }

        Double resultRate = dueDeliveries == 0
                ? null
                : finalizedDueDeliveries / (double) dueDeliveries;
        return new TeacherAssignmentSummaryResponse(
                openAssignments,
                finalizedDeliveries,
                overdueIncompleteDeliveries,
                dueDeliveries,
                finalizedDueDeliveries,
                resultRate);
    }

    private static boolean isFinalized(AssessmentAttemptStatus status) {
        return status == AssessmentAttemptStatus.SUBMITTED
                || status == AssessmentAttemptStatus.TIMED_OUT;
    }

    private static TeacherAssignmentSummaryResponse emptySummary() {
        return new TeacherAssignmentSummaryResponse(0, 0, 0, 0, 0, null);
    }

    private record DeliveryKey(Long assignmentId, Long studentId) {
    }
}
