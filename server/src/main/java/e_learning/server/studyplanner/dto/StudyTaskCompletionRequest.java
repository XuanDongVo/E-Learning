package e_learning.server.studyplanner.dto;

import jakarta.validation.constraints.NotNull;

public record StudyTaskCompletionRequest(@NotNull Boolean completed) {}
