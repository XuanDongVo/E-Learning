package e_learning.server.content.questionBank.controller;

import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.common.dto.UpdateStatusRequest;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.questionBank.dto.CreateQuestionBankRequest;
import e_learning.server.content.questionBank.dto.QuestionBankResponse;
import e_learning.server.content.questionBank.dto.UpdateQuestionBankRequest;
import e_learning.server.content.questionBank.service.QuestionBankService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/content/question-banks")
@RequiredArgsConstructor
public class QuestionBankController {
    private final QuestionBankService questionBankService;

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionBankResponse>> create(@Valid @RequestBody CreateQuestionBankRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question bank created successfully", questionBankService.create(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionBankResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(questionBankService.get(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuestionBankResponse>>> list(
            @RequestParam Long topicId,
            @RequestParam(defaultValue = "false") boolean includeArchived
    ) {
        return ResponseEntity.ok(ApiResponse.success(questionBankService.list(topicId, includeArchived)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionBankResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionBankRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Question bank updated successfully", questionBankService.update(id, request)));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<QuestionBankResponse>> archive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Question bank archived successfully", questionBankService.archive(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<QuestionBankResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Question bank status updated successfully", questionBankService.updateStatus(id, request)));
    }

    @PutMapping("/order")
    public ResponseEntity<ApiResponse<Void>> reorder(
            @RequestParam Long topicId,
            @Valid @RequestBody ReorderRequest request
    ) {
        questionBankService.reorder(topicId, request);
        return ResponseEntity.ok(ApiResponse.success("Question banks reordered successfully", null));
    }
}
