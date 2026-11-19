package e_learning.server.content.knowledge.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

/** Mutable authoring state; never serve to Student. */
@Entity
@Table(name = "knowledge_note_drafts")
@Getter @Setter
public class KnowledgeNoteDraft {
    @Id
    @Column(name = "knowledge_note_id")
    private Long knowledgeNoteId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "knowledge_note_id")
    private KnowledgeNote note;

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
    private Integer schemaVersion = 1;

    @Column(name = "edit_version", nullable = false)
    private Long editVersion = 0L;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    void onWrite() { updatedAt = LocalDateTime.now(); }
}
