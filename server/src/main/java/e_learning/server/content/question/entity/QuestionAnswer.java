package e_learning.server.content.question.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "content_question_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    @Column(name = "answer_text", nullable = false, columnDefinition = "TEXT")
    private String answerText;
    @Column(name = "normalized_answer", nullable = false, columnDefinition = "TEXT")
    private String normalizedAnswer;
    @Column(name = "matching_mode", nullable = false, length = 30)
    private String matchingMode;
}
