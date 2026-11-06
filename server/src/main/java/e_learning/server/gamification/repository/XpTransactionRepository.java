package e_learning.server.gamification.repository;

import e_learning.server.gamification.entity.XpSourceType;
import e_learning.server.gamification.entity.XpTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/** Durable XP ledger access used by the atomic Activity reward workflow. */
public interface XpTransactionRepository extends JpaRepository<XpTransaction, Long> {
    Optional<XpTransaction> findBySourceTypeAndActivitySessionId(
            XpSourceType sourceType, Long activitySessionId);
    Optional<XpTransaction> findByIdempotencyKey(String idempotencyKey);
}
