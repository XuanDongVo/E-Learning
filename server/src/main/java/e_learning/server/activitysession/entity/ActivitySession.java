package e_learning.server.activitysession.entity;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.SelectionStrategy;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activity_sessions")
@Getter @Setter @NoArgsConstructor
public class ActivitySession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "student_id")
    private User student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "activity_id")
    private Activity activity;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ActivityMode mode;
    @Enumerated(EnumType.STRING) @Column(name = "selection_strategy", nullable = false, length = 30)
    private SelectionStrategy selectionStrategy;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ActivitySessionStatus status = ActivitySessionStatus.IN_PROGRESS;
    @Column(name = "started_at", nullable = false) private LocalDateTime startedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @Column(name = "total_questions", nullable = false) private int totalQuestions;
    @Column(name = "first_correct_count", nullable = false) private int firstCorrectCount;
    @Column(name = "final_correct_count", nullable = false) private int finalCorrectCount;
    @Column(name = "hint_used_count", nullable = false) private int hintUsedCount;
    @Column(precision = 5, scale = 2) private BigDecimal score;
    private Integer lives;
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC") private List<ActivitySessionQuestion> questions = new ArrayList<>();

    public ActivitySession(User student, Activity activity, ActivityMode mode,
                           SelectionStrategy selectionStrategy, int totalQuestions, Integer lives) {
        this.student = student; this.activity = activity; this.mode = mode;
        this.selectionStrategy = selectionStrategy; this.totalQuestions = totalQuestions;
        this.lives = lives; this.startedAt = LocalDateTime.now();
    }
    public void addQuestion(ActivitySessionQuestion question) { question.setSession(this); questions.add(question); }
}
