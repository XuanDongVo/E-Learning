package e_learning.server.assessmentattempt.entity;

import e_learning.server.assignment.entity.AssignmentItem;
import e_learning.server.question.entity.Question;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(
        name = "assessment_attempt_questions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_attempt_question_position",
                columnNames = {"attempt_id", "position"}
        ),
        indexes = {
                @Index(name = "ix_assessment_attempt_questions_attempt", columnList = "attempt_id,position"),
                @Index(name = "ix_assessment_attempt_questions_question", columnList = "question_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class AssessmentAttemptQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private AssessmentAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_item_id")
    private AssignmentItem assignmentItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question sourceQuestion;

    @Column(name = "section_key", length = 200)
    private String sectionKey;

    @Column(name = "section_title", length = 255)
    private String sectionTitle;

    @Column(nullable = false)
    private Integer position;

    /**
     * Immutable question snapshot at attempt start: {@code student} (safe render) + {@code grading} (server-only).
     * Must not be rewritten after create.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "question_snapshot", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> questionSnapshot;

    /**
     * Student draft answer payload. Null until the first successful autosave.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "answer_payload", columnDefinition = "jsonb")
    private Map<String, Object> answerPayload;

    /**
     * Optimistic lock for draft answer updates only. Starts at 0; increments on each answer save.
     */
    @Version
    @Column(nullable = false)
    private long revision;

    /**
     * Last time answer_payload was successfully saved. Null if never answered.
     */
    @Column(name = "saved_at")
    private LocalDateTime savedAt;

    @Column(name = "possible_points", nullable = false, precision = 10, scale = 2)
    private BigDecimal possiblePoints = BigDecimal.ZERO;

    @Column(name = "is_required", nullable = false)
    private boolean required = false;

    @Column(name = "is_example", nullable = false)
    private boolean example;

    @Column(name = "snapshot_version", nullable = false)
    private Integer snapshotVersion = 1;

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
