package e_learning.server.content.media.dto;

import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.enums.MediaType;

public record MediaResponse(
        Long id,
        MediaType mediaType,
        String originalName,
        String format,
        String mimeType,
        Long sizeBytes,
        Integer width,
        Integer height,
        Integer durationSeconds,
        MediaStatus status,
        String url
) {
}