package e_learning.server.content.media.service;

public record CloudinaryUploadResult(
        String publicId,
        String resourceType,
        String format,
        long bytes,
        Integer width,
        Integer height,
        Integer durationSeconds
) {
}
