package e_learning.server.activitysession.entity;

import e_learning.server.activitysession.enums.GuidedQuestionStage;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "activity_session_guided_progress")
@Getter
@Setter
@NoArgsConstructor
public class ActivitySessionGuidedProgress {
    @Id
    @Column(name = "session_question_id")
    private Long sessionQuestionId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "session_question_id")
    private ActivitySessionQuestion sessionQuestion;

    @Column(name = "snapshot_schema_version", nullable = false)
    private int snapshotSchemaVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot_payload", columnDefinition = "jsonb", nullable = false)
    private String snapshotPayload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GuidedQuestionStage stage;

    @Column(name = "current_step_index", nullable = false)
    private int currentStepIndex;

    public ActivitySessionGuidedProgress(int snapshotSchemaVersion, String snapshotPayload) {
        this.snapshotSchemaVersion = snapshotSchemaVersion;
        this.snapshotPayload = snapshotPayload;
        this.stage = GuidedQuestionStage.STEP_ACTIVE;
        this.currentStepIndex = 0;
    }
}
