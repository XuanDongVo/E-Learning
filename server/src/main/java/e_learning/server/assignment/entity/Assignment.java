package e_learning.server.assignment.entity;

import e_learning.server.assignment.enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments", uniqueConstraints = @UniqueConstraint(
        name = "uq_assignment_grade_year_name",
        columnNames = {"grade_level", "academic_year", "name"}))
@Getter
@Setter
@NoArgsConstructor
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

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

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(name = "show_answers_after_submit", nullable = false)
    private boolean showAnswersAfterSubmit = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Getter(AccessLevel.NONE)
    private List<AssignmentTarget> targets = new ArrayList<>();

    public void replaceTargets(List<AssignmentTarget> nextTargets) {
        targets.clear();
        nextTargets.forEach(target -> {
            target.setAssignment(this);
            targets.add(target);
        });
    }

    public List<AssignmentTarget> getTargets() {
        return List.copyOf(targets);
    }
}
