package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswerMutation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AssessmentAttemptAnswerMutationRepository extends JpaRepository<AssessmentAttemptAnswerMutation, Long> {
    Optional<AssessmentAttemptAnswerMutation> findByAttemptIdAndRequestId(Long attemptId, UUID requestId);
}
