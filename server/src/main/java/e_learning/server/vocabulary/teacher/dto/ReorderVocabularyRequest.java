package e_learning.server.vocabulary.teacher.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReorderVocabularyRequest(
        @NotEmpty(message = "Danh sách sắp xếp không được để trống")
        List<ReorderItem> items
) {
    public record ReorderItem(
            @NotNull(message = "ID từ vựng không được để trống")
            Long id,

            @NotNull(message = "Thứ tự không được để trống")
            Integer displayOrder
    ) {}
}

