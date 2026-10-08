package e_learning.server.activitysession.repository;

import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ActivitySessionQuestionRepository extends JpaRepository<ActivitySessionQuestion, Long> {
    Optional<ActivitySessionQuestion> findByIdAndSessionId(Long id, Long sessionId);
}
