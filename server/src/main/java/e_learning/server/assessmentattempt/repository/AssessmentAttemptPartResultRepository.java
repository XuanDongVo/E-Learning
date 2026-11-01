package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptPartResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface AssessmentAttemptPartResultRepository extends JpaRepository<AssessmentAttemptPartResult, Long> {
    List<AssessmentAttemptPartResult> findAllByAttemptQuestionAttemptIdOrderByAttemptQuestionPositionAscPartKeyAsc(
            Long attemptId);

    @Query("""
            select r from AssessmentAttemptPartResult r
            join fetch r.attemptQuestion q
            where q.attempt.id in :attemptIds
            order by q.attempt.id, q.position, r.partKey
            """)
    List<AssessmentAttemptPartResult> findAllByAttemptIds(@Param("attemptIds") Collection<Long> attemptIds);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from AssessmentAttemptPartResult r where r.attemptQuestion.attempt.id = :attemptId")
    void deleteByAttemptId(@Param("attemptId") Long attemptId);
}
