package e_learning.server.activitysession.entity;

import e_learning.server.question.entity.Question;
import e_learning.server.gamification.xp.entity.XpQuestionOutcome;
import e_learning.server.activitysession.enums.GuidedQuestionStage;
import e_learning.server.activitysession.enums.QuestionDeliveryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_session_questions",
        uniqueConstraints = {@UniqueConstraint(name = "uq_activity_session_question_position", columnNames = {"session_id","position"})})
@Getter @Setter @NoArgsConstructor
public class ActivitySessionQuestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id") private ActivitySession session;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "question_id") private Question question;
    @Column(name = "snapshot_schema_version") private Integer snapshotSchemaVersion;
    @Column(name = "snapshot_content_revision") private Long snapshotContentRevision;
    @Column(name = "snapshot_payload", columnDefinition = "TEXT") private String snapshotPayload;
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 30)
    private QuestionDeliveryType deliveryType;
    @OneToOne(mappedBy = "sessionQuestion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private ActivitySessionGuidedProgress guidedProgress;
    @Column(name = "guided_snapshot_schema_version") private Integer guidedSnapshotSchemaVersion;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "guided_snapshot_payload", columnDefinition = "jsonb") private String guidedSnapshotPayload;
    @Enumerated(EnumType.STRING) @Column(name = "guided_stage", length = 30) private GuidedQuestionStage guidedStage;
    @Column(name = "guided_current_step_index") private Integer guidedCurrentStepIndex;
    // Null means Classic. GuidedRuntimeService initializes all three mutable
    // fields together with its immutable snapshot before persistence.
    @Column(name = "guided_current_step_attempts") private Integer guidedCurrentStepAttempts;
    @Column(name = "guided_current_step_hint_used") private Boolean guidedCurrentStepHintUsed;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "guided_hint_used_step_keys", columnDefinition = "jsonb")
    private String guidedHintUsedStepKeys;
    @Column(nullable = false) private int position;
    @Column(name = "served_at") private LocalDateTime servedAt;
    @Column(name = "deadline_at") private LocalDateTime deadlineAt;
    @Column(name = "answer_attempts", nullable = false) private int answerAttempts;
    @Column(name = "first_correct") private Boolean firstCorrect;
    @Column(name = "final_correct") private Boolean finalCorrect;
    @Column(name = "hint_used", nullable = false) private boolean hintUsed;
    @Column(nullable = false) private boolean resolved;
    @Enumerated(EnumType.STRING)
    @Column(name = "resolution_reason", length = 20) private ActivityQuestionResolution resolutionReason;
    @Enumerated(EnumType.STRING)
    @Column(name = "xp_outcome", length = 40) private XpQuestionOutcome xpOutcome;
    @Column(name = "xp_base") private Integer xpBase;
    @Column(name = "xp_final") private Integer xpFinal;
    @Column(name = "xp_resolved_at") private LocalDateTime xpResolvedAt;
    public ActivitySessionQuestion(Question question, int position) { this.question = question; this.position = position; }

    public ActivitySessionQuestion(Question question, int position, ActivityQuestionSnapshot snapshot) {
        this(question, position);
        this.snapshotSchemaVersion = snapshot.schemaVersion();
        this.snapshotContentRevision = snapshot.contentRevision();
        this.snapshotPayload = snapshot.payload();
    }

    public void attachGuidedProgress(ActivitySessionGuidedProgress progress) {
        this.guidedProgress = progress;
        progress.setSessionQuestion(this);
    }
}
