package e_learning.server.content.questionBank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateQuestionBankRequest {
    @NotNull(message = "Topic ID is required")
    private Long topicId;

    @NotBlank(message = "Question bank name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private Integer displayOrder;
}
