package e_learning.server.content.questionBank.entity;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.topic.entity.Topic;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_question_banks", uniqueConstraints = @UniqueConstraint(name = "uk_content_bank_topic_name", columnNames = {"topic_id", "name"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(length = 1000)
    private String description;
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
        LocalDateTime now = LocalDateTime.now();
        updatedAt = now;
    }
}
