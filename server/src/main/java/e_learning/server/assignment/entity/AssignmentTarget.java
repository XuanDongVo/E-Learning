package e_learning.server.assignment.entity;

import e_learning.server.assignment.enums.AssignmentTargetType;
import e_learning.server.classes.entity.ClassEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assignment_targets")
@Getter
@Setter
@NoArgsConstructor
public class AssignmentTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private AssignmentTargetType targetType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity;
}
