package e_learning.server.student.controller;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.student.dto.*;
import e_learning.server.student.service.StudentManagementService;
import e_learning.server.student.service.StudentProfileService;
import e_learning.server.user.entity.UserStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/v1/users/students")
@RequiredArgsConstructor
public class StudentManagementController {
    private final StudentManagementService managementService;
    private final StudentProfileService profileService;

    @GetMapping
    public ApiResponse<PageResponse<StudentSummaryResponse>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus accountStatus,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long gradeId,
            @RequestParam(required = false) Boolean noClass,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        return ApiResponse.success(profileService.listForTeacher(
                Long.valueOf(Objects.requireNonNull(jwt.getSubject())), search, accountStatus, classId, gradeId, noClass, page, size));
    }


    @GetMapping("/{studentId}")
    public ApiResponse<StudentDetailResponse> detail(
            @PathVariable Long studentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(
                profileService.getForTeacher(studentId, Long.valueOf(Objects.requireNonNull(jwt.getSubject())))
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StudentDetailResponse> create(
            @Valid @RequestBody CreateStudentRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(
                managementService.create(request, Long.valueOf(Objects.requireNonNull(jwt.getSubject())))
        );
    }

    @PatchMapping("/{studentId}/status")
    public ApiResponse<Void> updateStatus(
            @PathVariable Long studentId,
            @Valid @RequestBody UpdateStudentStatusRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        managementService.updateStatus(
                studentId,
                request.status(),
                Long.valueOf(Objects.requireNonNull(jwt.getSubject()))
        );
        return ApiResponse.success(null);
    }
}
