package e_learning.server.vocabulary.review.repository;

import e_learning.server.vocabulary.review.entity.VocabularyReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VocabularyReviewLogRepository extends JpaRepository<VocabularyReviewLog, Long> {
    Optional<VocabularyReviewLog> findByStudentIdAndRequestId(Long studentId, UUID requestId);
}
