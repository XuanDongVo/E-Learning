package e_learning.server.assessmentattempt.entity;

import e_learning.server.assessmentattempt.enums.AttemptPartStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "assessment_attempt_part_results",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_attempt_part_result_key",
                columnNames = {"attempt_question_id", "part_key"}
        ),
        indexes = @Index(name = "ix_attempt_part_results_question", columnList = "attempt_question_id")
)
@Getter
@Setter
@NoArgsConstructor
public class AssessmentAttemptPartResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_question_id", nullable = false)
    private AssessmentAttemptQuestion attemptQuestion;

    @Column(name = "part_key", nullable = false, length = 200)
    private String partKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AttemptPartStatus status;

    @Column(name = "earned_points", nullable = false, precision = 10, scale = 2)
    private BigDecimal earnedPoints = BigDecimal.ZERO;

    @Column(name = "possible_points", nullable = false, precision = 10, scale = 2)
    private BigDecimal possiblePoints = BigDecimal.ZERO;

    @Column(name = "snapshot_version", nullable = false)
    private Integer snapshotVersion = 1;

    @Column(name = "normalizer_version", length = 100)
    private String normalizerVersion;

    @Column(name = "grading_version", length = 100)
    private String gradingVersion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
