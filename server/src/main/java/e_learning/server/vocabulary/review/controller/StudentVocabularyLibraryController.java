package e_learning.server.vocabulary.review.controller;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyLibrarySummaryResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyLibraryWordResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyReviewQueueResponse;
import e_learning.server.vocabulary.review.service.StudentVocabularyLibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/vocabulary")
@RequiredArgsConstructor
public class StudentVocabularyLibraryController {

    private final StudentVocabularyLibraryService service;

    @GetMapping("/words/summary")
    public ApiResponse<StudentVocabularyLibrarySummaryResponse> summary(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(
                service.getSummary(Long.valueOf(jwt.getSubject()))
        );
    }

    @GetMapping("/words/learned")
    public ApiResponse<PageResponse<StudentVocabularyLibraryWordResponse>> learned(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success(
                service.getLearned(
                        Long.valueOf(jwt.getSubject()),
                        page, size, search
                )
        );
    }

    @GetMapping("/words/due")
    public ApiResponse<PageResponse<StudentVocabularyLibraryWordResponse>> due(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success(
                service.getDue(
                        Long.valueOf(jwt.getSubject()),
                        page, size, search
                )
        );
    }

    @GetMapping("/words/waiting")
    public ApiResponse<PageResponse<StudentVocabularyLibraryWordResponse>> waiting(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success(
                service.getWaiting(
                        Long.valueOf(jwt.getSubject()),
                        page, size, search
                )
        );
    }

    @GetMapping("/review-queue")
    public ApiResponse<StudentVocabularyReviewQueueResponse> reviewQueue(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(service.getReviewQueue(Long.valueOf(jwt.getSubject())));
    }
}
