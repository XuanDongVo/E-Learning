package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.AssignmentQuestionIdempotency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssignmentQuestionIdempotencyRepository
        extends JpaRepository<AssignmentQuestionIdempotency, Long> {
    Optional<AssignmentQuestionIdempotency> findByAssignmentIdAndIdempotencyKey(
            Long assignmentId,
            String idempotencyKey
    );
}
