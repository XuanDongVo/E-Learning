package e_learning.server.activitysession.controller;

import e_learning.server.activitysession.dto.*;
import e_learning.server.activitysession.service.ActivitySessionService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ActivitySessionController {
    private final ActivitySessionService service;

    @GetMapping("/v1/activities/{activityId}/session-options")
    public ApiResponse<ActivitySessionOptionsResponse> options(
            @PathVariable Long activityId, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.options(activityId, studentId(jwt)));
    }

    @PostMapping("/v1/activities/{activityId}/sessions")
    public ApiResponse<ActivitySessionResponse> start(
            @PathVariable Long activityId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody(required = false) ActivitySessionStartRequest request) {
        return ApiResponse.success(service.start(activityId, studentId(jwt), request));
    }

    @GetMapping("/v1/activity-sessions/{sessionId}")
    public ApiResponse<ActivitySessionResponse> get(@PathVariable Long sessionId, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.get(sessionId, studentId(jwt)));
    }

    @PostMapping("/v1/activity-sessions/{sessionId}/questions/{questionId}/answer")
    public ApiResponse<ActivitySessionAnswerResponse> answer(
            @PathVariable Long sessionId, @PathVariable Long questionId,
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ActivitySessionAnswerRequest request) {
        return ApiResponse.success(service.answer(sessionId, questionId, studentId(jwt), request));
    }

    @PostMapping("/v1/activity-sessions/{sessionId}/questions/{questionId}/hint")
    public ApiResponse<ActivitySessionHintResponse> hint(
            @PathVariable Long sessionId, @PathVariable Long questionId,
            @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.hint(sessionId, questionId, studentId(jwt)));
    }

    @PostMapping("/v1/activity-sessions/{sessionId}/finish")
    public ApiResponse<ActivitySessionResponse> finish(@PathVariable Long sessionId, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.finish(sessionId, studentId(jwt)));
    }

    @GetMapping("/v1/activity-sessions/{sessionId}/result")
    public ApiResponse<ActivitySessionResultResponse> result(@PathVariable Long sessionId, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.result(sessionId, studentId(jwt)));
    }

    private Long studentId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
