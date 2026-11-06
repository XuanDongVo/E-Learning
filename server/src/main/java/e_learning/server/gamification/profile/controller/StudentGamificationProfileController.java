package e_learning.server.gamification.profile.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.gamification.profile.dto.StudentGamificationProfileResponse;
import e_learning.server.gamification.profile.service.StudentGamificationProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/student/gamification")
public class StudentGamificationProfileController {
    private final StudentGamificationProfileService profileService;

    @GetMapping("/profile")
    public ApiResponse<StudentGamificationProfileResponse> profile(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(profileService.profile(Long.parseLong(jwt.getSubject())));
    }
}
