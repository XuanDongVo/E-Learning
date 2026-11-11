package e_learning.server.vocabulary.review.entity;

import e_learning.server.user.entity.User;
import e_learning.server.vocabulary.entity.VocabularyWord;
import io.github.openspacedrepetition.Rating;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "vocabulary_review_logs", uniqueConstraints =
        @UniqueConstraint(name = "uk_vocabulary_review_request", columnNames = {"student_id", "request_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyReviewLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "progress_id", nullable = false)
    private StudentVocabularyProgress progress;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "word_id", nullable = false)
    private VocabularyWord word;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Rating rating;

    @Column(name = "reviewed_at", nullable = false)
    private Instant reviewedAt;

    @Column(name = "due_at", nullable = false)
    private Instant dueAt;

    @Column(name = "card_state", nullable = false, length = 15)
    private String cardState;

    @Column(name = "review_count", nullable = false)
    private int reviewCount;

    @Column(name = "card_json", nullable = false, columnDefinition = "TEXT")
    private String cardJson;

    @Column(name = "review_log_json", nullable = false, columnDefinition = "TEXT")
    private String reviewLogJson;
}
