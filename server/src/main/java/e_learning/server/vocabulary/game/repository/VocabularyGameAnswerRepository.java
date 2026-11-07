package e_learning.server.vocabulary.game.repository;

import e_learning.server.vocabulary.game.entity.VocabularyGameAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VocabularyGameAnswerRepository extends JpaRepository<VocabularyGameAnswer, Long> {

    List<VocabularyGameAnswer> findBySessionId(Long sessionId);
}

