package e_learning.server.vocabulary.review.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.vocabulary.review.dto.VocabularyProgressDashboardResponse;
import e_learning.server.vocabulary.review.service.StudentVocabularyProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only Vocabulary Progress dashboard.
 * The authenticated principal is the only source of student identity.
 */
@RestController
@RequestMapping("/v1/student/vocabulary/progress")
@RequiredArgsConstructor
public class StudentVocabularyProgressController {
    private final StudentVocabularyProgressService service;

    @GetMapping
    public ApiResponse<VocabularyProgressDashboardResponse> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        Long studentId = Long.valueOf(jwt.getSubject());
        return ApiResponse.success(service.getDashboard(studentId));
    }
}
