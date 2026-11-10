package e_learning.server.vocabulary.game.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record GamePlayWordDto(
        Long id,
        String word,
        String meaningVi,
        String pronunciationUk,
        String pronunciationUs,
        String partOfSpeech,
        String exampleSentence,
        String exampleMeaningVi,
        String imageUrl,
        List<String> distractors
) {}

