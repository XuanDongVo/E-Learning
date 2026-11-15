package e_learning.server.activitysession.repository;

import e_learning.server.activitysession.entity.ActivitySessionGuidedStepAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface ActivitySessionGuidedStepAttemptRepository extends JpaRepository<ActivitySessionGuidedStepAttempt, Long> {
    Optional<ActivitySessionGuidedStepAttempt> findBySessionQuestionIdAndRequestId(Long sessionQuestionId, UUID requestId);
    long countBySessionQuestionIdAndStepKey(Long sessionQuestionId, String stepKey);
    List<ActivitySessionGuidedStepAttempt> findAllBySessionQuestionIdOrderByAttemptNumberAsc(Long sessionQuestionId);
}
