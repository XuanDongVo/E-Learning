package e_learning.server.gamification.leaderboard.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.gamification.leaderboard.dto.StudentLeaderboardHonorsResponse;
import e_learning.server.gamification.leaderboard.dto.StudentLeaderboardResponse;
import e_learning.server.gamification.leaderboard.dto.StudentLearningActivityResponse;
import e_learning.server.gamification.leaderboard.service.StudentLeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/student/gamification/leaderboard")
public class StudentLeaderboardController {
    private final StudentLeaderboardService leaderboardService;

    @GetMapping
    public ApiResponse<StudentLeaderboardResponse> leaderboard(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "XP") String metric,
            @RequestParam(defaultValue = "ALL") String period) {
        return ApiResponse.success(leaderboardService.leaderboard(
                Long.parseLong(jwt.getSubject()), metric, period));
    }

    @GetMapping("/honors")
    public ApiResponse<StudentLeaderboardHonorsResponse> honors(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(leaderboardService.honors(Long.parseLong(jwt.getSubject())));
    }

    @GetMapping("/recent-activity")
    public ApiResponse<StudentLearningActivityResponse> recentActivity(
            @RequestParam(defaultValue = "8") int limit) {
        return ApiResponse.success(leaderboardService.recentActivity(limit));
    }
}
