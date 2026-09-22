package e_learning.server.content.question.entity;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.common.enums.Difficulty;
import e_learning.server.content.common.enums.QuestionType;
import e_learning.server.content.questionbank.entity.QuestionBank;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_bank_id", nullable = false)
    private QuestionBank questionBank;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuestionType type;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(columnDefinition = "TEXT")
    private String explanation;
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentStatus status;
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = ContentStatus.DRAFT;
        if (displayOrder == null) displayOrder = 0;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
