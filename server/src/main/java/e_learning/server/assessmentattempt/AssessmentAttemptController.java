package e_learning.server.assessmentattempt;

import e_learning.server.assessmentattempt.dto.request.StartOrResumeAttemptRequest;
import e_learning.server.assessmentattempt.dto.response.AttemptIntroResponse;
import e_learning.server.assessmentattempt.dto.response.AttemptRuntimeResponse;
import e_learning.server.assessmentattempt.service.AssessmentAttemptService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

/**
 * Sprint 1 controller shell only.
 *
 * Authentication identity is extracted here; student authorization and all Assignment
 * business validation must live in AssessmentAttemptService. The service method is
 * intentionally a TODO stub until the owner implements the backend logic.
 */
@RestController
@RequestMapping("/v1/student/assignments")
@RequiredArgsConstructor
public class AssessmentAttemptController {
    private final AssessmentAttemptService attemptService;

    @GetMapping("/{assignmentId}/assessment-attempt/intro")
    public ResponseEntity<ApiResponse<AttemptIntroResponse>> getIntro(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ResponseEntity.ok(ApiResponse.success(
                attemptService.getIntro(assignmentId, studentId)
        ));
    }

    @PostMapping("/{assignmentId}/assessment-attempt")
    public ResponseEntity<ApiResponse<AttemptRuntimeResponse>> startOrResume(
            @PathVariable Long assignmentId,
            @Valid @RequestBody StartOrResumeAttemptRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ResponseEntity.ok(ApiResponse.success(
                attemptService.startOrResume(assignmentId, studentId, request)
        ));
    }
}
