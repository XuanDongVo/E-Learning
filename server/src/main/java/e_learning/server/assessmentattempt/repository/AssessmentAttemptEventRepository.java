package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttemptEvent;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface AssessmentAttemptEventRepository extends JpaRepository<AssessmentAttemptEvent, Long> {
    List<AssessmentAttemptEvent> findByAttemptIdOrderByOccurredAtAsc(Long attemptId);

    @Query("""
            select count(e) from AssessmentAttemptEvent e
            where e.attempt.id = :attemptId
              and e.eventType in :types
            """)
    long countByAttemptIdAndEventTypeIn(
            @Param("attemptId") Long attemptId,
            @Param("types") Collection<AssessmentAttemptEventType> types
    );
}
