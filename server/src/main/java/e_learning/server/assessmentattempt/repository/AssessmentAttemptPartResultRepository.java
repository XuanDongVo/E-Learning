package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptPartResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssessmentAttemptPartResultRepository extends JpaRepository<AssessmentAttemptPartResult, Long> {
    List<AssessmentAttemptPartResult> findAllByAttemptQuestionAttemptIdOrderByAttemptQuestionPositionAscPartKeyAsc(
            Long attemptId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from AssessmentAttemptPartResult r where r.attemptQuestion.attempt.id = :attemptId")
    void deleteByAttemptId(@Param("attemptId") Long attemptId);
}
