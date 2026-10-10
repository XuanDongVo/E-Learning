package e_learning.server.content.unit.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.unit.dto.student.StudentUnitDetailResponse;
import e_learning.server.content.unit.dto.student.StudentUnitSummaryResponse;
import e_learning.server.content.unit.service.StudentUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/v1/student/units")
@RequiredArgsConstructor
public class StudentUnitController {
    private final StudentUnitService studentUnitService;

    @GetMapping
    public ApiResponse<List<StudentUnitSummaryResponse>> getMyUnits(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(studentUnitService.getMyUnits(Long.valueOf(Objects.requireNonNull(jwt.getSubject()))));
    }

    @GetMapping("/{unitId}")
    public ApiResponse<StudentUnitDetailResponse> getMyUnit(@PathVariable Long unitId, @AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.success(studentUnitService.getMyUnit(Long.valueOf(Objects.requireNonNull(jwt.getSubject())), unitId));
    }
}