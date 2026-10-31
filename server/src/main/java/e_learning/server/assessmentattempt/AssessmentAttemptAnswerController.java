package e_learning.server.assessmentattempt;

import e_learning.server.assessmentattempt.dto.request.SaveAttemptAnswerRequest;
import e_learning.server.assessmentattempt.dto.response.SaveAttemptAnswerResponse;
import e_learning.server.assessmentattempt.service.AssessmentAttemptAnswerService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

/**
 * Answer autosave endpoint scaffold.
 *
 * The service intentionally contains no business implementation yet.
 * Do not expose this endpoint to students until the service TODOs are completed and tested.
 */
@RestController
@RequestMapping("/v1/student/assessment-attempts")
@RequiredArgsConstructor
public class AssessmentAttemptAnswerController {
    private final AssessmentAttemptAnswerService answerService;

    @PutMapping("/{attemptId}/questions/{attemptQuestionId}/answer")
    public ResponseEntity<ApiResponse<SaveAttemptAnswerResponse>> saveAnswer(
            @PathVariable Long attemptId,
            @PathVariable Long attemptQuestionId,
            @Valid @RequestBody SaveAttemptAnswerRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ResponseEntity.ok(ApiResponse.success(
                answerService.saveAnswer(attemptId, attemptQuestionId, studentId, request)
        ));
    }
}
