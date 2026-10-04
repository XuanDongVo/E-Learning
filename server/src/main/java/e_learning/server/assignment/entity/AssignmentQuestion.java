package e_learning.server.assignment.entity;

import e_learning.server.question.entity.Question;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assignment_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentQuestion {

    @Id
    @Column(name = "question_id")
    private Long questionId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(
            name = "question_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_assignment_question_question")
    )
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "assignment_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_assignment_question_assignment")
    )
    private Assignment assignment;
}
