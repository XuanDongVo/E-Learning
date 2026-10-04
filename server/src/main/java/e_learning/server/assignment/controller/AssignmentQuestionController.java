package e_learning.server.assignment.controller;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.service.AssignmentQuestionService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/assignments/{assignmentId}/questions")
@RequiredArgsConstructor
public class AssignmentQuestionController {

    private final AssignmentQuestionService assignmentQuestionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentQuestionResponse>>> list(
            @PathVariable Long assignmentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(assignmentQuestionService.list(assignmentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<AssignmentQuestionResponse>>> create(
            @PathVariable Long assignmentId,
            @Valid @RequestBody List<CreateAssignmentQuestionRequest> request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Assignment questions created",
                assignmentQuestionService.create(assignmentId, request)
        ));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<ApiResponse<AssignmentQuestionResponse>> update(
            @PathVariable Long assignmentId,
            @PathVariable Long questionId,
            @Valid @RequestBody UpdateAssignmentQuestionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Assignment question updated",
                assignmentQuestionService.update(assignmentId, questionId, request)
        ));
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long assignmentId,
            @Valid @RequestBody BulkDeleteAssignmentQuestionsRequest request
    ) {
        assignmentQuestionService.bulkDelete(assignmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Assignment questions deleted", null));
    }
}
