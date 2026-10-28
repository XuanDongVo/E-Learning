package e_learning.server.assignment.controller;

import e_learning.server.assignment.dto.student.StudentAssignmentItemResponse;
import e_learning.server.assignment.service.StudentAssignmentService;
import e_learning.server.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/v1/student/assignments")
@RequiredArgsConstructor
public class StudentAssignmentController {

    private final StudentAssignmentService studentAssignmentService;

    @GetMapping
    public ApiResponse<List<StudentAssignmentItemResponse>> getMyAssignments(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String status,
            @RequestParam(name = "q", required = false) String query
    ) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ApiResponse.success(studentAssignmentService.getMyAssignments(studentId, status, query));
    }
}
