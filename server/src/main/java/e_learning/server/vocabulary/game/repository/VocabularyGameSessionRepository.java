package e_learning.server.vocabulary.game.repository;

import e_learning.server.vocabulary.game.entity.VocabularyGameSession;
import e_learning.server.vocabulary.game.enums.GameSessionStatus;
import e_learning.server.vocabulary.game.enums.GameType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VocabularyGameSessionRepository extends JpaRepository<VocabularyGameSession, Long> {

    Optional<VocabularyGameSession> findByIdAndStudentId(Long id, Long studentId);

    List<VocabularyGameSession> findByStudentIdAndUnitIdOrderByStartedAtDesc(Long studentId, Long unitId);

    List<VocabularyGameSession> findByStudentIdAndStatusOrderByStartedAtDesc(Long studentId, GameSessionStatus status);

    Optional<VocabularyGameSession> findTopByStudentIdAndUnitIdAndGameTypeAndStatusOrderByTotalScoreDesc(
            Long studentId, Long unitId, GameType gameType, GameSessionStatus status);
}

