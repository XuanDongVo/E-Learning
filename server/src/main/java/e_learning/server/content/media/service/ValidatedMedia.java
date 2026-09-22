package e_learning.server.content.media.service;

import e_learning.server.content.media.enums.MediaType;

public record ValidatedMedia(
        MediaType mediaType,
        String originalName,
        String extension,
        String mimeType,
        long sizeBytes
) {
}
