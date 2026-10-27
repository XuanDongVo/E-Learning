package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssessmentAttemptQuestionRepository extends JpaRepository<AssessmentAttemptQuestion, Long> {
    List<AssessmentAttemptQuestion> findAllByAttemptIdOrderByPositionAsc(Long attemptId);

    Optional<AssessmentAttemptQuestion> findByIdAndAttemptId(Long id, Long attemptId);
}
