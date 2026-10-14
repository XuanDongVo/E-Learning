package e_learning.server.assignment.controller;

import e_learning.server.assignment.dto.AssignmentCompositionRequest;
import e_learning.server.assignment.dto.AssignmentCompositionResponse;
import e_learning.server.assignment.service.AssignmentCompositionService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/assignments/{assignmentId}/composition")
@RequiredArgsConstructor
public class AssignmentCompositionController {
    private final AssignmentCompositionService compositionService;

    @GetMapping
    public ResponseEntity<ApiResponse<AssignmentCompositionResponse>> get(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(ApiResponse.success(compositionService.get(assignmentId)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<AssignmentCompositionResponse>> put(
            @PathVariable Long assignmentId,
            @Valid @RequestBody AssignmentCompositionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Assignment composition saved", compositionService.replace(assignmentId, request)));
    }
}
