package e_learning.server.vocabulary.game.dto;

import e_learning.server.vocabulary.game.enums.GameType;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record FinishGameSessionResponse(
        Long sessionId,
        Long unitId,
        String unitName,
        GameType gameType,
        int totalWords,
        int firstTryCorrect,
        BigDecimal accuracyPercentage,
        int totalScore,
        int earnedXp,
        int timeSpentSeconds,
        List<WordSummaryDto> wordsMastered,
        List<WordSummaryDto> wordsToReview
) {}

