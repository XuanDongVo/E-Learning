package e_learning.server.assessmentattempt;

import e_learning.server.assessmentattempt.dto.request.AttemptEventRequest;
import e_learning.server.assessmentattempt.dto.response.CreateAttemptEventResponse;
import e_learning.server.assessmentattempt.service.AssessmentAttemptEventService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

/**
 * Student soft signals for formal attempt monitoring (not anti-cheat proof).
 */
@RestController
@RequestMapping("/v1/student/assessment-attempts")
@RequiredArgsConstructor
public class AssessmentAttemptEventController {
    private final AssessmentAttemptEventService eventService;

    @PostMapping("/{attemptId}/events")
    public ResponseEntity<ApiResponse<CreateAttemptEventResponse>> createEvent(
            @PathVariable Long attemptId,
            @Valid @RequestBody AttemptEventRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ResponseEntity.ok(ApiResponse.success(
                eventService.recordClientSignal(attemptId, studentId, request)
        ));
    }
}
