
package e_learning.server.assessmentattempt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "assessment_attempt_answer_mutations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_attempt_answer_mutation_request",
                        columnNames = {"attempt_id", "request_id"}
                )
        },
        indexes = {
                @Index(
                        name = "ix_attempt_answer_mutation_question",
                        columnList = "attempt_question_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class AssessmentAttemptAnswerMutation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private AssessmentAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_question_id", nullable = false)
    private AssessmentAttemptQuestion attemptQuestion;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    /**
     * SHA-256 of the canonical request payload.
     * Used to detect reuse of a requestId with different content.
     */
    @Column(name = "payload_hash", nullable = false, length = 64)
    private String payloadHash;

    /**
     * Revision produced by this successfully processed request.
     */
    @Column(name = "result_revision", nullable = false)
    private long resultRevision;

    @Column(name = "saved_at", nullable = false)
    private LocalDateTime savedAt;
}
