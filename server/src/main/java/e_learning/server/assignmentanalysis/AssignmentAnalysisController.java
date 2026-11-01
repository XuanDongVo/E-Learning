package e_learning.server.assignmentanalysis;

import e_learning.server.assignmentanalysis.dto.AssignmentAnalysisOverviewResponse;
import e_learning.server.assignmentanalysis.dto.AttemptReviewResponse;
import e_learning.server.assignmentanalysis.dto.QuestionAnalysisListResponse;
import e_learning.server.assignmentanalysis.dto.StudentResultsPageResponse;
import e_learning.server.assignmentanalysis.service.AssignmentAnalysisService;
import e_learning.server.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/teacher/assignments/{assignmentId}")
@RequiredArgsConstructor
public class AssignmentAnalysisController {

    private final AssignmentAnalysisService analysisService;

    @GetMapping("/analytics/overview")
    public ResponseEntity<ApiResponse<AssignmentAnalysisOverviewResponse>> overview(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                analysisService.getOverview(assignmentId, teacherId(jwt))
        ));
    }

    @GetMapping("/analytics/students")
    public ResponseEntity<ApiResponse<StudentResultsPageResponse>> students(
            @PathVariable Long assignmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String lifecycleStatus,
            @RequestParam(required = false) String deadlineState,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                analysisService.getStudents(
                        assignmentId,
                        teacherId(jwt),
                        page,
                        size,
                        lifecycleStatus,
                        deadlineState,
                        classId,
                        search
                )
        ));
    }

    @GetMapping("/analytics/questions")
    public ResponseEntity<ApiResponse<QuestionAnalysisListResponse>> questions(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                analysisService.getQuestions(assignmentId, teacherId(jwt))
        ));
    }

    @GetMapping("/students/{studentId}/attempt")
    public ResponseEntity<ApiResponse<AttemptReviewResponse>> attemptReview(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                analysisService.getAttemptReview(assignmentId, studentId, teacherId(jwt))
        ));
    }

    private static Long teacherId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
