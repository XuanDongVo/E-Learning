package e_learning.server.content.question.controller;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.content.question.dto.*;
import e_learning.server.content.question.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
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
            @RequestParam(defaultValue = "25") int size) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestions(
                bankId, search, type, difficulty, isComplete, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(questionService.getQuestion(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> create(
            @Valid @RequestBody List<CreateQuestionRequest> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", questionService.createQuestion(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Question updated successfully", questionService.updateQuestion(id, request)));
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Valid @RequestBody BulkDeleteQuestionsRequest request) {
        questionService.deleteQuestion(request);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }
}