package e_learning.server.vocabulary.entity;

import e_learning.server.vocabulary.enums.VocabularyPartOfSpeech;

public record RelatedTerm(String term, String meaningVi, VocabularyPartOfSpeech partOfSpeech) {}
