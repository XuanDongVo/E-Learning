package e_learning.server.vocabulary.game.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record WordAnswerResultDto(
        @NotNull
        Long wordId,

        Boolean firstTryCorrect,

        Integer attemptsCount,

        Integer responseTimeMs
) {}

