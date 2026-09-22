package e_learning.server.content.media.service;

import e_learning.server.content.media.config.MediaProperties;
import e_learning.server.content.media.enums.MediaType;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MediaValidationService {

    private final MediaProperties properties;

    private final Tika tika = new Tika();

    private static final Map<String, Set<String>> ALLOWED_EXTENSIONS = Map.of(
            "image/jpeg", Set.of("jpg", "jpeg"),
            "image/png", Set.of("png"),

            "audio/mpeg", Set.of("mp3"),
            "audio/wav", Set.of("wav"),
            "audio/x-wav", Set.of("wav")
    );

    public ValidatedMedia validate(MultipartFile file, MediaType requestedType) {

        validateNotEmpty(file);

        long size = file.getSize();

        validateSize(size, requestedType);

        String originalName = sanitizeOriginalName(file.getOriginalFilename());

        String extension = extractExtension(originalName);

        String detectedMimeType = detectMimeType(file, originalName);

        validateMimeType(requestedType, detectedMimeType);

        validateExtension(detectedMimeType, extension);

        validateContent(file, requestedType, detectedMimeType);

        return new ValidatedMedia(
                requestedType,
                originalName,
                extension,
                detectedMimeType,
                size
        );
    }

    private void validateNotEmpty(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Media file must not be empty.");
        }
    }

    private void validateSize(long size, MediaType mediaType) {

        long maxSize = getRule(mediaType).getMaxSizeBytes();

        if (size > maxSize) {
            throw new IllegalArgumentException(
                    "File size exceeds the maximum allowed size."
            );
        }
    }

    private String detectMimeType(
            MultipartFile file,
            String originalName
    ) {

        try (InputStream inputStream = file.getInputStream()) {

            String detected = tika.detect(
                    inputStream,
                    originalName
            );

            if (detected == null || detected.isBlank()) {
                throw new IllegalArgumentException(
                        "Unable to determine file type."
                );
            }

            return detected.toLowerCase(Locale.ROOT);

        } catch (IOException ex) {
            throw new IllegalArgumentException(
                    "Unable to inspect uploaded file.",
                    ex
            );
        }
    }

    private void validateMimeType(
            MediaType mediaType,
            String detectedMimeType
    ) {

        Set<String> allowedTypes =
                getRule(mediaType).getAllowedMimeTypes();

        if (!allowedTypes.contains(detectedMimeType)) {

            throw new IllegalArgumentException(
                    "Unsupported media format."
            );
        }
    }

    private void validateExtension(
            String mimeType,
            String extension
    ) {

        Set<String> allowedExtensions =
                ALLOWED_EXTENSIONS.get(mimeType);

        if (allowedExtensions == null ||
                !allowedExtensions.contains(extension)) {

            throw new IllegalArgumentException(
                    "File extension does not match its content type."
            );
        }
    }

    private void validateContent(
            MultipartFile file,
            MediaType mediaType,
            String detectedMimeType
    ) {

        if (mediaType == MediaType.IMAGE) {
            validateImage(file);
        }

        if (mediaType == MediaType.AUDIO) {
            validateAudio(detectedMimeType);
        }
    }

    private void validateImage(MultipartFile file) {

        try (InputStream inputStream = file.getInputStream()) {

            BufferedImage image = ImageIO.read(inputStream);

            if (image == null) {
                throw new IllegalArgumentException(
                        "Uploaded file is not a valid image."
                );
            }

        } catch (IOException ex) {
            throw new IllegalArgumentException(
                    "Unable to validate image.",
                    ex
            );
        }
    }

    private void validateAudio(String detectedMimeType) {

        /*
         * MVP:
         * Tika MIME detection + size + extension validation.
         *
         * Duration/codec validation can be added post-release.
         */
        if (!detectedMimeType.startsWith("audio/")) {
            throw new IllegalArgumentException(
                    "Uploaded file is not a valid audio file."
            );
        }
    }

    private MediaProperties.MediaRule getRule(MediaType mediaType) {
        return properties.getRule(mediaType);
    }

    private String sanitizeOriginalName(String originalName) {

        if (originalName == null || originalName.isBlank()) {
            return "unnamed";
        }

        String fileName = Paths
                .get(originalName)
                .getFileName()
                .toString();

        fileName = fileName
                .replaceAll("[\\p{Cntrl}]", "")
                .trim();

        if (fileName.isBlank()) {
            return "unnamed";
        }

        return fileName.length() > 255
                ? fileName.substring(0, 255)
                : fileName;
    }

    private String extractExtension(String fileName) {

        int dotIndex = fileName.lastIndexOf('.');

        if (dotIndex <= 0 || dotIndex == fileName.length() - 1) {
            throw new IllegalArgumentException(
                    "File extension is required."
            );
        }

        return fileName
                .substring(dotIndex + 1)
                .toLowerCase(Locale.ROOT);
    }
}