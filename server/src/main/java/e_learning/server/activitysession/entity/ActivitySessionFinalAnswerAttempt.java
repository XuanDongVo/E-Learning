package e_learning.server.activitysession.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_session_final_answer_attempts")
@Getter
@NoArgsConstructor
public class ActivitySessionFinalAnswerAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_question_id", nullable = false)
    private ActivitySessionQuestion sessionQuestion;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Column(name = "request_id", nullable = false, updatable = false)
    private UUID requestId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "submitted_answer", nullable = false, columnDefinition = "jsonb")
    private String submittedAnswer;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "retry_available", nullable = false)
    private boolean retryAvailable;

    @Column(nullable = false)
    private boolean resolved;

    @Column(name = "answer_revealed", nullable = false)
    private boolean answerRevealed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ActivitySessionFinalAnswerAttempt(
            ActivitySessionQuestion sessionQuestion,
            int attemptNumber,
            UUID requestId,
            String submittedAnswer,
            boolean correct,
            boolean retryAvailable,
            boolean resolved,
            boolean answerRevealed) {
        this.sessionQuestion = sessionQuestion;
        this.attemptNumber = attemptNumber;
        this.requestId = requestId;
        this.submittedAnswer = submittedAnswer;
        this.correct = correct;
        this.retryAvailable = retryAvailable;
        this.resolved = resolved;
        this.answerRevealed = answerRevealed;
        this.createdAt = LocalDateTime.now();
    }
}
