package e_learning.server.assessmentattempt.entity;

import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "assessment_attempts",
        uniqueConstraints = @UniqueConstraint(name = "uq_assessment_attempt_assignment_student",
                columnNames = {"assignment_id", "student_id"}),
        indexes = {
                @Index(name = "ix_assessment_attempt_student_status", columnList = "student_id,status"),
                @Index(name = "ix_assessment_attempt_assignment_status", columnList = "assignment_id,status"),
                @Index(name = "ix_assessment_attempt_class_status", columnList = "class_id_at_start,status")
        })
@Getter
@Setter
@NoArgsConstructor
public class AssessmentAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "class_id_at_start", nullable = false)
    private Long classIdAtStart;

    @Column(name = "class_name_at_start", nullable = false, length = 100)
    private String classNameAtStart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssessmentAttemptStatus status = AssessmentAttemptStatus.IN_PROGRESS;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "timed_out_at")
    private LocalDateTime timedOutAt;

    @Column(name = "time_limit_minutes", nullable = false)
    private Integer timeLimitMinutes;

    @Column(name = "deadline_at", nullable = false)
    private LocalDateTime deadlineAt;

    @Column(name = "total_possible_points", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPossiblePoints = BigDecimal.ZERO;

    @Column(name = "total_earned_points", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalEarnedPoints = BigDecimal.ZERO;

    @Column(name = "percentage_score", precision = 7, scale = 4)
    private BigDecimal percentageScore;

    @Column(name = "is_late", nullable = false)
    private boolean late;

    @Column(name = "active_session_id")
    private UUID activeSessionId;

    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "document_snapshot", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> documentSnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings_snapshot", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> settingsSnapshot;

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
