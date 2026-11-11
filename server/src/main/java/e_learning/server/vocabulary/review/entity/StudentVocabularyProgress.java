package e_learning.server.vocabulary.review.entity;

import e_learning.server.user.entity.User;
import e_learning.server.vocabulary.entity.VocabularyWord;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "student_vocabulary_progress", uniqueConstraints =
        @UniqueConstraint(name = "uk_student_vocabulary_progress", columnNames = {"student_id", "word_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentVocabularyProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "word_id", nullable = false)
    private VocabularyWord word;

    @Column(name = "card_json", nullable = false, columnDefinition = "TEXT")
    private String cardJson;

    @Column(name = "due_at", nullable = false)
    private Instant dueAt;

    @Builder.Default
    @Column(name = "review_count", nullable = false)
    private int reviewCount = 0;

    @Column(name = "last_reviewed_at")
    private Instant lastReviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
