package e_learning.server.vocabulary.game.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record GamePlayWordDto(
        Long id,
        String word,
        String meaningVi,
        String pronunciation,
        String partOfSpeech,
        String exampleSentence,
        String exampleMeaningVi,
        String audioUrl,
        String imageUrl,
        List<String> distractors
) {}

