package e_learning.server.vocabulary.game.dto;

import lombok.Builder;

@Builder
public record WordSummaryDto(
        Long id,
        String word,
        String meaningVi,
        String pronunciation,
        String audioUrl,
        boolean firstTryCorrect
) {}

