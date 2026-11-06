package e_learning.server.gamification.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** Rollout boundary for binding Activity XP policy to newly started sessions. */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "gamification.activity-xp")
public class ActivityXpProperties {
    private boolean enabled = false;
}
