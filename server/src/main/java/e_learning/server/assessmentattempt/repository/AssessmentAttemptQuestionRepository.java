package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AssessmentAttemptQuestionRepository extends JpaRepository<AssessmentAttemptQuestion, Long> {
    List<AssessmentAttemptQuestion> findAllByAttemptIdOrderByPositionAsc(Long attemptId);

    Optional<AssessmentAttemptQuestion> findByIdAndAttemptId(Long id, Long attemptId);

    @Query("""
            select q from AssessmentAttemptQuestion q
            where q.attempt.id in :attemptIds
            order by q.attempt.id, q.position
            """)
    List<AssessmentAttemptQuestion> findAllByAttemptIdInOrderByAttemptIdAscPositionAsc(
            @Param("attemptIds") Collection<Long> attemptIds);
}
