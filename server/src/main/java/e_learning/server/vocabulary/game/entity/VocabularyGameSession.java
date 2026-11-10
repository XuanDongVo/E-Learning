package e_learning.server.vocabulary.game.entity;

import e_learning.server.content.unit.entity.Unit;
import e_learning.server.user.entity.User;
import e_learning.server.vocabulary.game.enums.GameMode;
import e_learning.server.vocabulary.game.enums.GameSessionStatus;
import e_learning.server.vocabulary.game.enums.GameType;
import e_learning.server.vocabulary.game.enums.PronunciationAccent;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vocabulary_game_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyGameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false, length = 50)
    private GameType gameType;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false, length = 20)
    @Builder.Default
    private GameMode mode = GameMode.PRACTICE;

    @Enumerated(EnumType.STRING)
    @Column(name = "pronunciation_accent", nullable = false, length = 2)
    @Builder.Default
    private PronunciationAccent accent = PronunciationAccent.US;

    @ElementCollection
    @CollectionTable(name = "vocabulary_game_session_words", joinColumns = @JoinColumn(name = "session_id"))
    @OrderColumn(name = "position")
    @Column(name = "word_id", nullable = false)
    @Builder.Default
    private List<Long> wordIds = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private GameSessionStatus status = GameSessionStatus.IN_PROGRESS;

    @Column(name = "total_words", nullable = false)
    @Builder.Default
    private Integer totalWords = 0;

    @Column(name = "first_try_correct", nullable = false)
    @Builder.Default
    private Integer firstTryCorrect = 0;

    @Column(name = "total_score", nullable = false)
    @Builder.Default
    private Integer totalScore = 0;

    @Column(name = "accuracy_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal accuracyPercentage = BigDecimal.ZERO;

    @Column(name = "earned_xp")
    @Builder.Default
    private Integer earnedXp = 0;

    @Column(name = "time_spent_seconds", nullable = false)
    @Builder.Default
    private Integer timeSpentSeconds = 0;

    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @PrePersist
    void onCreate() {
        startedAt = LocalDateTime.now();
        if (mode == null) mode = GameMode.PRACTICE;
        if (accent == null) accent = PronunciationAccent.US;
        if (status == null) status = GameSessionStatus.IN_PROGRESS;
        if (totalWords == null) totalWords = 0;
        if (firstTryCorrect == null) firstTryCorrect = 0;
        if (totalScore == null) totalScore = 0;
        if (accuracyPercentage == null) accuracyPercentage = BigDecimal.ZERO;
        if (earnedXp == null) earnedXp = 0;
        if (timeSpentSeconds == null) timeSpentSeconds = 0;
    }
}

