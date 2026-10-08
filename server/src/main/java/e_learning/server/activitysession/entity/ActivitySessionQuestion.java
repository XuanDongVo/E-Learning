package e_learning.server.activitysession.entity;

import e_learning.server.question.entity.Question;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_session_questions",
        uniqueConstraints = {@UniqueConstraint(name = "uq_activity_session_question_position", columnNames = {"session_id","position"})})
@Getter @Setter @NoArgsConstructor
public class ActivitySessionQuestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "session_id") private ActivitySession session;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "question_id") private Question question;
    @Column(nullable = false) private int position;
    @Column(name = "served_at") private LocalDateTime servedAt;
    @Column(name = "deadline_at") private LocalDateTime deadlineAt;
    @Column(name = "answer_attempts", nullable = false) private int answerAttempts;
    @Column(name = "first_correct") private Boolean firstCorrect;
    @Column(name = "final_correct") private Boolean finalCorrect;
    @Column(name = "hint_used", nullable = false) private boolean hintUsed;
    @Column(nullable = false) private boolean resolved;
    public ActivitySessionQuestion(Question question, int position) { this.question = question; this.position = position; }
}
