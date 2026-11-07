package e_learning.server.vocabulary.game.dto;

import lombok.Builder;

@Builder
public record GameUnitSummaryDto(
        Long id,
        String code,
        String name,
        String description,
        Long coverMediaId,
        String coverUrl,
        Integer displayOrder,
        long vocabularyCount
) {}

