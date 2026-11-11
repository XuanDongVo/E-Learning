package e_learning.server.vocabulary.game.dto;

import e_learning.server.vocabulary.game.enums.GameMode;
import e_learning.server.vocabulary.game.enums.GameType;
import e_learning.server.vocabulary.game.enums.PronunciationAccent;
import lombok.Builder;

import java.util.List;

@Builder
public record StartGameSessionResponse(
        Long sessionId,
        Long unitId,
        String unitName,
        String unitCode,
        GameType gameType,
        GameMode mode,
        PronunciationAccent accent,
        List<GamePlayWordDto> words
) {}

