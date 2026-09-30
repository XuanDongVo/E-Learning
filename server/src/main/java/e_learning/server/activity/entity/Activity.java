package e_learning.server.activity.entity;

import e_learning.server.activity.enums.*;
import e_learning.server.content.topic.entity.Topic;
import e_learning.server.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(
        name = "activities",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_activity_topic_name",
                        columnNames = {"topic_id", "name"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "distribution_mode", nullable = false, length = 20)
    private DistributionMode distributionMode;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Enumerated(EnumType.STRING)
    @Column(name = "selection_strategy", nullable = false, length = 30)
    private SelectionStrategy selectionStrategy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityMode mode;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column
    private Integer lives;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = ActivityStatus.DRAFT;
        }

        if (distributionMode == null) {
            distributionMode = DistributionMode.EQUAL;
        }

        if (selectionStrategy == null) {
            selectionStrategy = SelectionStrategy.RANDOM;
        }

        if (mode == null) {
            mode = ActivityMode.LEARNING;
        }

        normalizeModeFields();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
        normalizeModeFields();
    }

    private void normalizeModeFields() {
        if (mode == ActivityMode.LEARNING) {
            timeLimitSeconds = null;
            lives = null;
        }
    }
}