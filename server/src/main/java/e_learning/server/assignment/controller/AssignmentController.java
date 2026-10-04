package e_learning.server.assignment.controller;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.service.AssignmentService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.list()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.get(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> create(
            @Valid @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Assignment created", assignmentService.create(request, Long.valueOf(jwt.getSubject()))));
    }
}
