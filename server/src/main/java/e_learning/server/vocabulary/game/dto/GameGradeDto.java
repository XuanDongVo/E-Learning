package e_learning.server.vocabulary.game.dto;

import lombok.Builder;

@Builder
public record GameGradeDto(
        Long id,
        String code,
        String name
) {}

