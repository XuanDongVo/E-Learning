package e_learning.server.content.question.entity;

import e_learning.server.content.media.entity.Media;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "question_media",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_question_media",
                        columnNames = {"question_id", "media_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "question_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_question_media_question")
    )
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "media_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_question_media_media")
    )
    private Media media;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
