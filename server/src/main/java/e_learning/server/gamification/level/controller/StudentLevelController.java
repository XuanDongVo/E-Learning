package e_learning.server.gamification.level.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.gamification.level.dto.StudentLevelResponse;
import e_learning.server.gamification.level.service.StudentLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/student/gamification")
public class StudentLevelController {
    private final StudentLevelService levelService;

    @GetMapping("/level")
    public ApiResponse<StudentLevelResponse> level(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(levelService.level(Long.parseLong(jwt.getSubject())));
    }
}
