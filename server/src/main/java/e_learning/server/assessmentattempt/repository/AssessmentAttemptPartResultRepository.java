package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptPartResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentAttemptPartResultRepository extends JpaRepository<AssessmentAttemptPartResult, Long> {
    List<AssessmentAttemptPartResult> findAllByAttemptQuestionAttemptIdOrderByAttemptQuestionPositionAscPartKeyAsc(Long attemptId);
}
