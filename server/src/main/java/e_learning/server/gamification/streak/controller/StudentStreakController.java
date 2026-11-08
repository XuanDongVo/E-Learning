package e_learning.server.gamification.streak.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.gamification.streak.dto.StudentStreakResponse;
import e_learning.server.gamification.streak.service.StudentStreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/student/gamification")
public class StudentStreakController {
    private final StudentStreakService streakService;

    @GetMapping("/streak")
    public ApiResponse<StudentStreakResponse> streak(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(streakService.streak(Long.parseLong(jwt.getSubject())));
    }
}
