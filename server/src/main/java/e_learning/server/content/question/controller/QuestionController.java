package e_learning.server.content.question.controller;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.common.enums.Difficulty;
import e_learning.server.content.common.enums.QuestionType;
import e_learning.server.content.question.dto.CreateQuestionRequest;
import e_learning.server.content.question.dto.QuestionResponse;
import e_learning.server.content.question.dto.UpdateQuestionRequest;
import e_learning.server.content.question.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/content/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuestionResponse>>> list(
            @RequestParam Long bankId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) QuestionType type,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) Boolean isComplete,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        PageResponse<QuestionResponse> response = questionService.getQuestions(
                bankId, search, type, difficulty, isComplete, page, size
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestion(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> create(@Valid @RequestBody List<CreateQuestionRequest> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", questionService.createQuestion(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", questionService.updateQuestion(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }
}
