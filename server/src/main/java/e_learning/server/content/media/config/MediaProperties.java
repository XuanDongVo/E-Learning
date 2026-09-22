package e_learning.server.content.media.config;

import e_learning.server.content.media.enums.MediaType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "content.media")
public class MediaProperties {

    private Map<MediaType, MediaRule> rules = new EnumMap<>(MediaType.class);

    public MediaRule getRule(MediaType mediaType) {
        MediaRule rule = rules.get(mediaType);
        if (rule == null) {
            throw new IllegalStateException("No media validation rule configured for " + mediaType);
        }
        return rule;
    }

    @Getter
    @Setter
    public static class MediaRule {
        private long maxSizeBytes;
        private Set<String> allowedMimeTypes = Set.of();
    }
}
