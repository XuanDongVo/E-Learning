package e_learning.server.activitysession.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;
import e_learning.server.activitysession.enums.GuidedQuestionStage;

@Entity
@Table(name = "activity_session_guided_step_attempts")
@Getter
@Setter
@NoArgsConstructor
public class ActivitySessionGuidedStepAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_question_id", nullable = false)
    private ActivitySessionQuestion sessionQuestion;

    @Column(name = "step_key", nullable = false, length = 120)
    private String stepKey;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Column(name = "request_id", nullable = false, updatable = false)
    private UUID requestId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "submitted_answer", nullable = false, columnDefinition = "jsonb")
    private String submittedAnswer;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "retry_available")
    private Boolean retryAvailable;

    @Column(name = "step_resolved")
    private Boolean stepResolved;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage_after", length = 30)
    private GuidedQuestionStage stageAfter;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ActivitySessionGuidedStepAttempt(ActivitySessionQuestion sessionQuestion, String stepKey,
                                            int attemptNumber, UUID requestId,
                                            String submittedAnswer, boolean correct,
                                            boolean retryAvailable, boolean stepResolved,
                                            GuidedQuestionStage stageAfter) {
        this.sessionQuestion = sessionQuestion;
        this.stepKey = stepKey;
        this.attemptNumber = attemptNumber;
        this.requestId = requestId;
        this.submittedAnswer = submittedAnswer;
        this.correct = correct;
        this.retryAvailable = retryAvailable;
        this.stepResolved = stepResolved;
        this.stageAfter = stageAfter;
        this.createdAt = LocalDateTime.now();
    }
}
