package e_learning.server.vocabulary.game.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;

@Builder
public record FinishGameSessionRequest(
        @NotNull
        Integer timeSpentSeconds,

        List<WordAnswerResultDto> answers
) {}

