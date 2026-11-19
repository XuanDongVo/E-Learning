package e_learning.server.content.knowledge.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

/** Published snapshot; the future service must never update existing revisions. */
@Entity
@Table(name = "knowledge_note_revisions",
       uniqueConstraints = @UniqueConstraint(name = "uk_knowledge_note_revision_number", columnNames = {"knowledge_note_id","revision_number"}))
@Getter @Setter
public class KnowledgeNoteRevision {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "knowledge_note_id", nullable = false)
    private KnowledgeNote note;

    @Column(name = "revision_number", nullable = false)
    private Integer revisionNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "summary_json", columnDefinition = "jsonb")
    private JsonNode summaryJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "document_json", nullable = false, columnDefinition = "jsonb")
    private JsonNode documentJson;

    @Column(name = "schema_version", nullable = false)
    private Integer schemaVersion;

    @Column(name = "published_by")
    private Long publishedBy;

    @Column(name = "published_at", nullable = false)
    private LocalDateTime publishedAt;

    @PrePersist
    void onCreate() { if (publishedAt == null) publishedAt = LocalDateTime.now(); }
}
