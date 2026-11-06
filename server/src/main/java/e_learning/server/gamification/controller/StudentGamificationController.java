package e_learning.server.gamification.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.gamification.dto.StudentGamificationProfileResponse;
import e_learning.server.gamification.dto.StudentStreakResponse;
import e_learning.server.gamification.service.StudentStreakService;
import e_learning.server.gamification.service.StudentLeaderboardService;
import e_learning.server.gamification.dto.StudentLeaderboardResponse;
import e_learning.server.gamification.dto.StudentLeaderboardHonorsResponse;
import e_learning.server.gamification.dto.StudentLearningActivityResponse;
import org.springframework.web.bind.annotation.RequestParam;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/student/gamification")
public class StudentGamificationController {
    private final StudentStreakService service;
    private final StudentLeaderboardService leaderboardService;

    @GetMapping("/profile")
    public ApiResponse<StudentGamificationProfileResponse> profile(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.profile(Long.parseLong(jwt.getSubject())));
    }

    @GetMapping("/streak")
    public ApiResponse<StudentStreakResponse> streak(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.streak(Long.parseLong(jwt.getSubject())));
    }
    @GetMapping("/leaderboard")
    public ApiResponse<StudentLeaderboardResponse> leaderboard(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "XP") String metric,
            @RequestParam(defaultValue = "ALL") String period) {
        return ApiResponse.success(leaderboardService.leaderboard(
                Long.parseLong(jwt.getSubject()), metric, period));
    }

    @GetMapping("/leaderboard/honors")
    public ApiResponse<StudentLeaderboardHonorsResponse> honors(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(leaderboardService.honors(Long.parseLong(jwt.getSubject())));
    }

    @GetMapping("/leaderboard/recent-activity")
    public ApiResponse<StudentLearningActivityResponse> recentActivity(
            @RequestParam(defaultValue = "8") int limit) {
        return ApiResponse.success(leaderboardService.recentActivity(limit));
    }
}
