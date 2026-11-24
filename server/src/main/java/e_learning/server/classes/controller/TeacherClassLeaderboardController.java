package e_learning.server.classes.controller;

import e_learning.server.classes.dto.ClassLeaderboardResponse;
import e_learning.server.classes.service.ClassLeaderboardService;
import e_learning.server.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/teacher/classes")
@RequiredArgsConstructor
public class TeacherClassLeaderboardController {

    private final ClassLeaderboardService classLeaderboardService;

    @GetMapping("/{classId}/leaderboard")
    public ResponseEntity<ApiResponse<ClassLeaderboardResponse>> getLeaderboard(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "XP") String metric,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        classLeaderboardService.getLeaderboard(
                                classId,
                                metric,
                                period,
                                search,
                                page,
                                size,
                                Long.valueOf(jwt.getSubject())
                        )
                )
        );
    }
}
