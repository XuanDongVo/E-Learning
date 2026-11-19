package e_learning.server.content.knowledge.entity;

import e_learning.server.content.topic.entity.Topic;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

/** Optional many-to-many association; Primary is per Topic, not per Note. */
@Entity
@Table(name = "knowledge_note_topic_links",
       uniqueConstraints = @UniqueConstraint(name = "uk_knowledge_note_topic_link", columnNames = {"knowledge_note_id","topic_id"}))
@Getter @Setter
public class KnowledgeNoteTopicLink {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "knowledge_note_id", nullable = false)
    private KnowledgeNote note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
