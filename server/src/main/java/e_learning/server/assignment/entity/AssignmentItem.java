package e_learning.server.assignment.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "assignment_items")
@Getter
@Setter
@NoArgsConstructor
public class AssignmentItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "section_id", nullable = false)
    private AssignmentSection section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_item_id")
    private AssignmentItem parentItem;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType;

    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "possible_points", nullable = false, precision = 8, scale = 2)
    private BigDecimal possiblePoints = BigDecimal.ZERO;

//    @Column(name = "is_required", nullable = false)
//    private boolean required = true;

    @Column(name = "is_example", nullable = false)
    private boolean example;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "block_payload", columnDefinition = "jsonb")
    private Map<String, Object> blockPayload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
