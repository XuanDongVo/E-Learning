package e_learning.server.vocabulary.entity;

import e_learning.server.content.unit.entity.Unit;
import e_learning.server.vocabulary.enums.VocabularyDifficulty;
import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "vocabulary_words")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(nullable = false, length = 100)
    private String word;

    @Column(name = "meaning_vi", nullable = false, length = 255)
    private String meaningVi;

    @Column(name = "pronunciation_uk", length = 100)
    private String pronunciationUk;

    @Column(name = "pronunciation_us", length = 100)
    private String pronunciationUs;

    @Enumerated(EnumType.STRING)
    @Column(name = "part_of_speech", length = 30)
    private VocabularyPartOfSpeech partOfSpeech;

    @Column(name = "example_sentence", columnDefinition = "TEXT")
    private String exampleSentence;

    @Column(name = "example_meaning_vi", columnDefinition = "TEXT")
    private String exampleMeaningVi;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "related_terms", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private VocabularyRelatedTerms relatedTerms = VocabularyRelatedTerms.empty();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VocabularyDifficulty difficulty = VocabularyDifficulty.EASY;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VocabularyStatus status = VocabularyStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (difficulty == null) difficulty = VocabularyDifficulty.EASY;
        if (displayOrder == null) displayOrder = 0;
        if (status == null) status = VocabularyStatus.ACTIVE;
        if (relatedTerms == null) relatedTerms = VocabularyRelatedTerms.empty();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

