package e_learning.server.content.question.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "content_question_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    @Column(name = "option_key", nullable = false, length = 5)
    private String optionKey;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(name = "is_correct", nullable = false)
    private boolean correct;
}
