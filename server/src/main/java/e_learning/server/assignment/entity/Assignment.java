package e_learning.server.assignment.entity;

import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.grades.entity.Grade;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assignments", uniqueConstraints = @UniqueConstraint(
        name = "uq_assignment_grade_year_name",
        columnNames = {"grade_id", "academic_year", "name"}))
@Getter
@Setter
@NoArgsConstructor
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grade_id", nullable = false)
    private Grade grade;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "class_ids", columnDefinition = "jsonb", nullable = false)
    private List<Long> classIds;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentStatus status = AssignmentStatus.DRAFT;

    @Column(name = "start_at")
    private LocalDateTime startAt;

        @Column(name = "due_at", nullable = false)
        private LocalDateTime dueAt;

    @Column(name = "time_limit_minutes", nullable = false)
    private Integer timeLimitMinutes;

    @Column(name = "show_answers_after_submit", nullable = false)
    private boolean showAnswersAfterSubmit = true;

    @Column(name = "show_score_after_submit", nullable = false)
    private boolean showScoreAfterSubmit = true;

    @Column(name = "show_points_per_question", nullable = false)
    private boolean showPointsPerQuestion = true;

    @Column(name = "composition_schema_version", nullable = false)
    private int compositionSchemaVersion = 1;

//    @Column(name = "composition_provenance", nullable = false, length = 30)
//    private String compositionProvenance = "AUTHOR_CREATED";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
