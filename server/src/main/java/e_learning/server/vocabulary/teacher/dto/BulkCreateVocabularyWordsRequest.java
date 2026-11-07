package e_learning.server.vocabulary.teacher.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkCreateVocabularyWordsRequest(
        @NotEmpty(message = "Danh sách từ vựng không được để trống")
        List<@Valid CreateVocabularyWordRequest> words
) {}

