package e_learning.server.activitysession.repository;

import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface ActivitySessionRepository extends JpaRepository<ActivitySession, Long> {
    List<ActivitySession> findAllByStudentIdAndStatusIn(Long studentId, Collection<ActivitySessionStatus> statuses);
}
