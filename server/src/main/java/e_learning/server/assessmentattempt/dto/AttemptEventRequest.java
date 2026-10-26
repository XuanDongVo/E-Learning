package e_learning.server.assessmentattempt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AttemptEventRequest(@NotNull EventType eventType, @NotBlank String activeSessionId) {
    public enum EventType { TAB_HIDDEN, FULLSCREEN_EXIT }
}
