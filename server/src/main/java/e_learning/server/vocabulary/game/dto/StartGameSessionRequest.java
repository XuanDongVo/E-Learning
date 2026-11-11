package e_learning.server.vocabulary.game.dto;

import e_learning.server.vocabulary.game.enums.GameMode;
import e_learning.server.vocabulary.game.enums.GameType;
import e_learning.server.vocabulary.game.enums.PronunciationAccent;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record StartGameSessionRequest(
        @NotNull(message = "Unit ID is required")
        Long unitId,

        @NotNull(message = "Game type is required")
        GameType gameType,

        GameMode mode,
        PronunciationAccent accent
) {}

