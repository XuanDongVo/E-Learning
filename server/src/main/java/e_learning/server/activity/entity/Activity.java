package e_learning.server.activity.entity;

import e_learning.server.activity.enums.*;
import e_learning.server.content.unit.entity.Unit;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "activities",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_activity_unit_name",
        columnNames = {"unit_id", "name"}
    )
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
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActivityStatus status = ActivityStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "distribution_mode", nullable = false, length = 30)
    private DistributionMode distributionMode;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @ElementCollection(targetClass = SelectionStrategy.class)
    @CollectionTable(
            name = "activity_selection_strategies",
            joinColumns = @JoinColumn(name = "activity_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "selection_strategy", nullable = false, length = 30)
    @Builder.Default
    private List<SelectionStrategy> availableSelectionStrategies = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityMode mode;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(name = "lives")
    private Integer lives;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @OneToMany(
        mappedBy = "activity",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<ActivityBank> banks = new ArrayList<>();
}
