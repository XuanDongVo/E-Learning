package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentAttemptEventRepository extends JpaRepository<AssessmentAttemptEvent, Long> {
    List<AssessmentAttemptEvent> findByAttemptIdOrderByOccurredAtAsc(Long attemptId);
}
