package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswerMutation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AssessmentAttemptAnswerMutationRepository extends JpaRepository<AssessmentAttemptAnswerMutation, Long> {
    Optional<AssessmentAttemptAnswerMutation> findByAttemptIdAndRequestId(Long attemptId, UUID requestId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from AssessmentAttemptAnswerMutation m where m.attempt.id = :attemptId")
    void deleteByAttemptId(@Param("attemptId") Long attemptId);
}
