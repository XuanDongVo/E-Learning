package e_learning.server.content.media.entity;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "media",
        indexes = {
                @Index(name = "idx_media_status", columnList = "status"),
                @Index(name = "idx_media_type", columnList = "media_type"),
                @Index(name = "idx_media_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    private MediaType mediaType;

    /**
     * Cloudinary public_id.
     * Example:
     * e_learning/questions/550e8400-e29b-41d4-a716-446655440000
     */
    @Column(name = "public_id", nullable = false, unique = true, length = 500)
    private String publicId;

    /**
     * Cloudinary resource_type:
     * image
     * video (audio is stored by Cloudinary as video resource type)
     */
    @Column(name = "resource_type", nullable = false, length = 20)
    private String resourceType;

    /**
     * Original filename sent by teacher.
     * Display only. Never use this as storage key.
     */
    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Column(name = "format", nullable = false, length = 20)
    private String format;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    /**
     * Image only.
     */
    @Column(name = "width")
    private Integer width;

    /**
     * Image only.
     */
    @Column(name = "height")
    private Integer height;

    /**
     * Audio only.
     *
     * Keep nullable in MVP.
     * Can be populated later when audio metadata processing is added.
     */
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MediaStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = MediaStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
