package e_learning.server.content.question.controller;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.common.enums.Difficulty;
import e_learning.server.content.common.enums.QuestionType;
import e_learning.server.content.question.dto.QuestionResponse;
import e_learning.server.content.question.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
