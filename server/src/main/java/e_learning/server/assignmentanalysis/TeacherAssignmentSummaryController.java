package e_learning.server.assignmentanalysis;

import e_learning.server.assignmentanalysis.dto.response.TeacherAssignmentSummaryResponse;
import e_learning.server.assignmentanalysis.service.TeacherAssignmentSummaryService;
import e_learning.server.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/teacher/assignments")
@RequiredArgsConstructor
public class TeacherAssignmentSummaryController {

    private final TeacherAssignmentSummaryService summaryService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<TeacherAssignmentSummaryResponse>> summary(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(ApiResponse.success(
                summaryService.getSummary(Long.valueOf(jwt.getSubject()))));
    }
}
