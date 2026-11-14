package e_learning.server.vocabulary.review.repository;

import e_learning.server.vocabulary.review.entity.VocabularyReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VocabularyReviewLogRepository extends JpaRepository<VocabularyReviewLog, Long> {
    interface QualifiedDayCount {
        LocalDate getReviewDate();
        Long getDistinctWordCount();
    }

    interface RecentUnitReview {
        Long getUnitId();
        Instant getLastReviewedAt();
    }

    interface AttentionWordProjection {
        Long getWordId();
        String getWord();
        String getMeaningVi();
        Long getUnitId();
        String getUnitName();
        Long getAgainCount();
        Long getHardCount();
        Instant getDueAt();
    }

    Optional<VocabularyReviewLog> findByStudentIdAndRequestId(Long studentId, UUID requestId);

    @Query(value = """
            SELECT (l.reviewed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS "reviewDate",
                   COUNT(DISTINCT l.word_id) AS "distinctWordCount"
            FROM vocabulary_review_logs l
            JOIN vocabulary_words w ON w.id = l.word_id
            JOIN content_units u ON u.id = w.unit_id
            WHERE l.student_id = :studentId
              AND u.id IN (:unitIds)
              AND w.status = 'ACTIVE'
              AND l.rating IN ('HARD', 'GOOD', 'EASY')
            GROUP BY (l.reviewed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
            ORDER BY "reviewDate"
            """, nativeQuery = true)
    List<QualifiedDayCount> findQualifiedDayCounts(
            @Param("studentId") Long studentId,
            @Param("unitIds") List<Long> unitIds);

    @Query(value = """
            SELECT u.id AS "unitId", MAX(l.reviewed_at) AS "lastReviewedAt"
            FROM vocabulary_review_logs l
            JOIN vocabulary_words w ON w.id = l.word_id
            JOIN content_units u ON u.id = w.unit_id
            WHERE l.student_id = :studentId
              AND u.id IN (:unitIds)
              AND w.status = 'ACTIVE'
            GROUP BY u.id
            ORDER BY MAX(l.reviewed_at) DESC, u.id DESC
            """, nativeQuery = true)
    List<RecentUnitReview> findRecentlyReviewedUnits(
            @Param("studentId") Long studentId,
            @Param("unitIds") List<Long> unitIds,
            Pageable pageable);

    @Query(value = """
            SELECT w.id AS "wordId",
                   w.word AS "word",
                   w.meaning_vi AS "meaningVi",
                   u.id AS "unitId",
                   u.name AS "unitName",
                   COUNT(*) FILTER (WHERE l.rating = 'AGAIN') AS "againCount",
                   COUNT(*) FILTER (WHERE l.rating = 'HARD') AS "hardCount",
                   p.due_at AS "dueAt"
            FROM vocabulary_review_logs l
            JOIN vocabulary_words w ON w.id = l.word_id
            JOIN content_units u ON u.id = w.unit_id
            JOIN student_vocabulary_progress p
              ON p.student_id = l.student_id AND p.word_id = l.word_id
            WHERE l.student_id = :studentId
              AND u.id IN (:unitIds)
              AND w.status = 'ACTIVE'
              AND l.rating IN ('AGAIN', 'HARD')
            GROUP BY w.id, w.word, w.meaning_vi, u.id, u.name, p.due_at
            ORDER BY MAX(l.reviewed_at) DESC, w.id DESC
            """, nativeQuery = true)
    List<AttentionWordProjection> findAttentionWords(
            @Param("studentId") Long studentId,
            @Param("unitIds") List<Long> unitIds,
            Pageable pageable);
}
