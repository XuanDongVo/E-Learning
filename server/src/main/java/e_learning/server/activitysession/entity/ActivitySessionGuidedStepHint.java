package e_learning.server.activitysession.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "activity_session_guided_step_hints")
@IdClass(ActivitySessionGuidedStepHint.Key.class)
@Getter
@Setter
@NoArgsConstructor
public class ActivitySessionGuidedStepHint {
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_question_id", nullable = false)
    private ActivitySessionQuestion sessionQuestion;

    @Id
    @Column(name = "step_key", nullable = false, length = 120)
    private String stepKey;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    public ActivitySessionGuidedStepHint(ActivitySessionQuestion sessionQuestion, String stepKey) {
        this.sessionQuestion = sessionQuestion;
        this.stepKey = stepKey;
        this.usedAt = LocalDateTime.now();
    }

    public static class Key implements Serializable {
        private Long sessionQuestion;
        private String stepKey;

        public Key() {}

        @Override
        public boolean equals(Object value) {
            if (this == value) return true;
            if (!(value instanceof Key key)) return false;
            return Objects.equals(sessionQuestion, key.sessionQuestion)
                    && Objects.equals(stepKey, key.stepKey);
        }

        @Override
        public int hashCode() {
            return Objects.hash(sessionQuestion, stepKey);
        }
    }
}
