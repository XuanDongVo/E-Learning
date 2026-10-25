package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssessmentAttemptAnswerRepository extends JpaRepository<AssessmentAttemptAnswer, Long> {
    Optional<AssessmentAttemptAnswer> findByAttemptQuestionId(Long attemptQuestionId);
}
