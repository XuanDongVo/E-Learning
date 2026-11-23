package e_learning.server.studyplanner.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.studyplanner.dto.StudyTaskCompletionRequest;
import e_learning.server.studyplanner.dto.StudyTaskResponse;
import e_learning.server.studyplanner.dto.StudyTaskUpsertRequest;
import e_learning.server.studyplanner.service.StudentStudyPlannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/student/study-plan/tasks")
public class StudentStudyPlannerController {
    private final StudentStudyPlannerService service;

    @GetMapping
    public ApiResponse<List<StudyTaskResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.list(studentId(jwt)));
    }

    @PostMapping
    public ApiResponse<StudyTaskResponse> create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody StudyTaskUpsertRequest request) {
        return ApiResponse.success(service.create(studentId(jwt), request));
    }

    @PutMapping("/{taskId}")
    public ApiResponse<StudyTaskResponse> update(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long taskId,
            @Valid @RequestBody StudyTaskUpsertRequest request) {
        return ApiResponse.success(service.update(studentId(jwt), taskId, request));
    }

    @PatchMapping("/{taskId}/completion")
    public ApiResponse<StudyTaskResponse> completion(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long taskId,
            @Valid @RequestBody StudyTaskCompletionRequest request) {
        return ApiResponse.success(service.setCompletion(studentId(jwt), taskId, request));
    }

    @DeleteMapping("/{taskId}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long taskId) {
        service.delete(studentId(jwt), taskId);
        return ApiResponse.success(null);
    }

    private Long studentId(Jwt jwt) { return Long.valueOf(jwt.getSubject()); }
}
