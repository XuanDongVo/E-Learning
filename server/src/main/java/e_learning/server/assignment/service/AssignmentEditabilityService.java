package e_learning.server.assignment.service;

import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Backend authoring lock for Assignments (ADR 0025).
 * Once any AssessmentAttempt exists for an Assignment, structure and scoring
 * mutations are rejected. Teachers must clone to change the test.
 * Operational transitions such as ARCHIVE remain allowed.
 */
@Service
@RequiredArgsConstructor
public class AssignmentEditabilityService {
    private final AssessmentAttemptRepository attemptRepository;

    /** Reject when Assignment is ARCHIVED (legacy lock). */
    public void ensureNotArchived(Assignment assignment) {
        if (assignment.getStatus() == AssignmentStatus.ARCHIVED) {
            throw new AppException(ErrorCode.ASSIGNMENT_QUESTIONS_LOCKED);
        }
    }

    /**
     * Reject structure / metadata / scoring mutations after the first attempt starts.
     * Also rejects ARCHIVED assignments.
     */
    public void ensureEditableForStructure(Assignment assignment) {
        ensureNotArchived(assignment);
        if (attemptRepository.existsByAssignmentId(assignment.getId())) {
            throw new AppException(ErrorCode.ASSIGNMENT_LOCKED_AFTER_ATTEMPT);
        }
    }

    /** Alias for question membership / content mutations. */
    public void ensureEditableForQuestion(Assignment assignment) {
        ensureEditableForStructure(assignment);
    }

    /** Alias for composition / points / scoring display settings. */
    public void ensureEditableForScoring(Assignment assignment) {
        ensureEditableForStructure(assignment);
    }
}
