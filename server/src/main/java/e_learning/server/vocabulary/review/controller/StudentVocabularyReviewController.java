package e_learning.server.vocabulary.review.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.vocabulary.review.dto.request.MarkVocabularyWordRequest;
import e_learning.server.vocabulary.review.dto.request.RecordVocabularyReviewRequest;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyCardResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyUnitOverviewResponse;
import e_learning.server.vocabulary.review.dto.response.VocabularyReviewPreviewResponse;
import e_learning.server.vocabulary.review.dto.response.VocabularyReviewResultResponse;
import e_learning.server.vocabulary.review.service.StudentVocabularyReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/student/vocabulary")
@RequiredArgsConstructor
public class StudentVocabularyReviewController {
    private final StudentVocabularyReviewService service;

    @GetMapping("/overview")
    public ApiResponse<List<StudentVocabularyUnitOverviewResponse>> overview(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.listOverview(Long.valueOf(jwt.getSubject())));
    }

    @GetMapping("/units/{unitId}/cards")
    public ApiResponse<List<StudentVocabularyCardResponse>> listCards(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long unitId) {
        return ApiResponse.success(service.listUnitCards(Long.valueOf(jwt.getSubject()), unitId));
    }

    @PostMapping("/words/{wordId}/reviews")
    public ApiResponse<VocabularyReviewResultResponse> review(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long wordId,
            @Valid @RequestBody RecordVocabularyReviewRequest request) {
        return ApiResponse.success(service.recordReview(Long.valueOf(jwt.getSubject()), wordId, request));
    }

    @PostMapping("/words/{wordId}/mark")
    public ApiResponse<VocabularyReviewResultResponse> markKnown(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long wordId,
            @Valid @RequestBody MarkVocabularyWordRequest request) {
        return ApiResponse.success(service.markKnown(Long.valueOf(jwt.getSubject()), wordId, request));
    }

    @DeleteMapping("/words/{wordId}/mark")
    public ApiResponse<Void> unmarkKnown(@AuthenticationPrincipal Jwt jwt, @PathVariable Long wordId) {
        service.unmarkKnown(Long.valueOf(jwt.getSubject()), wordId);
        return ApiResponse.success(null);
    }

    @GetMapping("/words/{wordId}/review-preview")
    public ApiResponse<VocabularyReviewPreviewResponse> preview(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long wordId) {
        return ApiResponse.success(service.previewReview(Long.valueOf(jwt.getSubject()), wordId));
    }
}
