package e_learning.server.assignment.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "assignment_sections",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_assignment_section_position",
                columnNames = {"assignment_id", "position"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class AssignmentSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Column(nullable = false)
    private Integer position;

    // English content
    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    // Vietnamese translation — optional
    @Column(name = "title_vi", length = 200)
    private String titleVi;

    @Column(name = "instructions_vi", columnDefinition = "TEXT")
    private String instructionsVi;
}