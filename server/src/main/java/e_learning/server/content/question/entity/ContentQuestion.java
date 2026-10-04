package e_learning.server.content.question.entity;

import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.question.entity.Question;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "content_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentQuestion {

    @Id
    @Column(name = "question_id")
    private Long questionId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(
            name = "question_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_content_question_question")
    )
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "question_bank_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_content_question_bank")
    )
    private QuestionBank questionBank;
}
