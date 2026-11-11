package e_learning.server.vocabulary.teacher.dto;

import e_learning.server.vocabulary.enums.VocabularyStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateWordStatusRequest(
        @NotNull(message = "Trạng thái không được để trống")
        VocabularyStatus status
) {}

