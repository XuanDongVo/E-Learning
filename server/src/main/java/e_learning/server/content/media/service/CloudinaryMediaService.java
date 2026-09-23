package e_learning.server.content.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import e_learning.server.content.media.enums.MediaType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryMediaService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.folder:e_learning}")
    private String folder;

    public CloudinaryUploadResult upload(
            MultipartFile file,
            MediaType mediaType
    ) {

        String publicId =
                folder + "/questions/" + UUID.randomUUID();

        String resourceType =
                mediaType == MediaType.IMAGE
                        ? "image"
                        : "video";

        try {

            Map<String, Object> options = ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", resourceType,

                    // Do not overwrite an existing asset.
                    "overwrite", false,

                    // We already generate our own unique public_id.
                    "use_filename", false,
                    "unique_filename", false,

                    // Keep delivery restricted.
                    "type", "authenticated"
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> result =
                    (Map<String, Object>) cloudinary
                            .uploader()
                            .upload(
                                    file.getBytes(),
                                    options
                            );

            return new CloudinaryUploadResult(
                    (String) result.get("public_id"),
                    (String) result.get("resource_type"),
                    (String) result.get("format"),
                    ((Number) result.get("bytes")).longValue(),
                    toInteger(result.get("width")),
                    toInteger(result.get("height")),
                    toInteger(result.get("duration"))
            );

        } catch (IOException ex) {
            throw new IllegalStateException(
                    "Failed to upload media to Cloudinary.",
                    ex
            );
        }
    }

    public void delete(
            String publicId,
            String resourceType
    ) {

        try {

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", resourceType,
                            "type", "authenticated",
                            "invalidate", true
                    )
            );

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "Failed to delete media from Cloudinary.",
                    ex
            );
        }
    }

        public String generatedUrl(String publicId, String resourceType, String format) {
                if (publicId == null || publicId.isBlank()) {
                        return null;
                }

                return cloudinary.url()
                                .resourceType(resourceType)
                                .type("authenticated")
                                .secure(true)
                                .signed(true)
                                .format(format)
                                .generate(publicId);
        }

        private Integer toInteger(Object value) {

        if (value instanceof Number number) {
            return number.intValue();
        }

        return null;
    }
}