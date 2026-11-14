package e_learning.server.question.guided;

import e_learning.server.question.entity.Question;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "question_guided_definitions")
@Getter
@Setter
@NoArgsConstructor
public class GuidedDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private Question question;

    @Column(name = "schema_version", nullable = false)
    private int schemaVersion = 1;

    @Version
    @Column(nullable = false)
    private long version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GuidedDefinitionStatus status = GuidedDefinitionStatus.DRAFT;

    @Column(name = "source_question_revision")
    private Long sourceQuestionRevision;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "definition_payload", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> definitionPayload;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
