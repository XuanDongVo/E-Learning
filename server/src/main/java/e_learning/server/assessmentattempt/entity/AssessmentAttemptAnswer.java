package e_learning.server.assessmentattempt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(
        name = "assessment_attempt_answers",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_attempt_answer_question",
                columnNames = "attempt_question_id"
        )
)
@Getter
@Setter
@NoArgsConstructor
public class AssessmentAttemptAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_question_id", nullable = false, unique = true)
    private AssessmentAttemptQuestion attemptQuestion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "answer_payload", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> answerPayload;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "normalized_value", columnDefinition = "jsonb")
    private Object normalizedValue;

    @Version
    @Column(nullable = false)
    private long revision;

    @Column(name = "saved_at", nullable = false)
    private LocalDateTime savedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (savedAt == null) savedAt = now;
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        LocalDateTime now = LocalDateTime.now();
        savedAt = now;
        updatedAt = now;
    }
}
