package e_learning.server.gamification.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.gamification.dto.StudentGamificationProfileResponse;
import e_learning.server.gamification.dto.StudentStreakResponse;
import e_learning.server.gamification.service.StudentStreakService;
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

    @GetMapping("/profile")
    public ApiResponse<StudentGamificationProfileResponse> profile(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.profile(Long.parseLong(jwt.getSubject())));
    }

    @GetMapping("/streak")
    public ApiResponse<StudentStreakResponse> streak(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(service.streak(Long.parseLong(jwt.getSubject())));
    }
}
