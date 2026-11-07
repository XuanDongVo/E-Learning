package e_learning.server.vocabulary.game.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.vocabulary.game.dto.*;
import e_learning.server.vocabulary.game.service.StudentVocabularyGameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/v1/student/game")
@RequiredArgsConstructor
public class StudentVocabularyGameController {

    private final StudentVocabularyGameService gameService;

    @GetMapping("/grades")
    public ApiResponse<List<GameGradeDto>> getGrades() {
        return ApiResponse.success(gameService.getGrades());
    }

    @GetMapping("/units")
    public ApiResponse<List<GameUnitSummaryDto>> getUnitsByGrade(@RequestParam Long gradeId) {
        return ApiResponse.success(gameService.getUnitsByGrade(gradeId));
    }

    @PostMapping("/sessions")
    public ApiResponse<StartGameSessionResponse> startSession(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody StartGameSessionRequest request) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ApiResponse.success(gameService.startSession(studentId, request));
    }

    @PostMapping("/sessions/{sessionId}/finish")
    public ApiResponse<FinishGameSessionResponse> finishSession(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long sessionId,
            @Valid @RequestBody FinishGameSessionRequest request) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ApiResponse.success(gameService.finishSession(studentId, sessionId, request));
    }
}

