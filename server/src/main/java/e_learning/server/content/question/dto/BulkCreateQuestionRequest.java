package e_learning.server.content.question.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkCreateQuestionRequest {
    @NotEmpty(message = "Questions list cannot be empty")
    @Valid
    private List<CreateQuestionRequest> questions;
}
