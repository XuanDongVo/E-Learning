package e_learning.server.activity.entity;

import e_learning.server.content.questionBank.entity.QuestionBank;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "activity_banks",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_activity_bank_source",
                        columnNames = {"activity_id", "question_bank_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_bank_id", nullable = false)
    private QuestionBank questionBank;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column
    private Integer percentage;

    @Column(name = "fixed_count")
    private Integer fixedCount;
}