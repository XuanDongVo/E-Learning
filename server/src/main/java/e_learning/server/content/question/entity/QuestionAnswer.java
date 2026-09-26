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
    @Column(name = "raw_value", nullable = false, columnDefinition = "TEXT")
    private String rawValue;
    @Column(name = "normalized_value", nullable = false, columnDefinition = "TEXT")
    private String normalizedValue;
}
