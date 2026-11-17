package e_learning.server.activitysession.repository;

import e_learning.server.activitysession.entity.ActivitySessionGuidedStepHint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivitySessionGuidedStepHintRepository
        extends JpaRepository<ActivitySessionGuidedStepHint, ActivitySessionGuidedStepHint.Key> {
    boolean existsBySessionQuestionIdAndStepKey(Long sessionQuestionId, String stepKey);
    List<ActivitySessionGuidedStepHint> findAllBySessionQuestionId(Long sessionQuestionId);
}
