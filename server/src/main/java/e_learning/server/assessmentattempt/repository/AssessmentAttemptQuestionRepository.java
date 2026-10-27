package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentAttemptQuestionRepository extends JpaRepository<AssessmentAttemptQuestion, Long> {
    List<AssessmentAttemptQuestion> findAllByAttemptIdOrderByPositionAsc(Long attemptId);


}
