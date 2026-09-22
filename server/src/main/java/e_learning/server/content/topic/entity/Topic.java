package e_learning.server.content.topic.entity;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.section.entity.Section;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_topics", uniqueConstraints = @UniqueConstraint(name = "uk_content_topic_section_name", columnNames = {"section_id", "name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Topic {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "section_id", nullable = false) private Section section;
    @Column(nullable = false, length = 150) private String name;
    @Column(length = 1000) private String description;
    @Column(name = "display_order", nullable = false) private Integer displayOrder;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private ContentStatus status;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
    @PrePersist void onCreate() { LocalDateTime now = LocalDateTime.now(); createdAt = now; updatedAt = now; if (status == null) status = ContentStatus.DRAFT; if (displayOrder == null) displayOrder = 0; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
