package e_learning.server.assessmentattempt.entity;

import e_learning.server.assessmentattempt.enums.AssessmentAttemptEventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
        name = "assessment_attempt_events",
        indexes = {
                @Index(name = "ix_assessment_attempt_events_attempt_time", columnList = "attempt_id,occurred_at"),
                @Index(name = "ix_assessment_attempt_events_type_time", columnList = "event_type,occurred_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class AssessmentAttemptEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private AssessmentAttempt attempt;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 40)
    private AssessmentAttemptEventType eventType;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "active_session_id")
    private UUID activeSessionId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metadata;

    @PrePersist
    void onCreate() {
        if (occurredAt == null) {
            occurredAt = LocalDateTime.now();
        }
        if (metadata == null) {
            metadata = Map.of();
        }
    }
}
