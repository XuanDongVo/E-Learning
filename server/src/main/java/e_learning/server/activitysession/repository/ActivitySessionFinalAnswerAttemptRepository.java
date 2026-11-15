package e_learning.server.activitysession.repository;

import e_learning.server.activitysession.entity.ActivitySessionFinalAnswerAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ActivitySessionFinalAnswerAttemptRepository
        extends JpaRepository<ActivitySessionFinalAnswerAttempt, Long> {
    Optional<ActivitySessionFinalAnswerAttempt> findBySessionQuestionIdAndRequestId(
            Long sessionQuestionId, UUID requestId);
}
