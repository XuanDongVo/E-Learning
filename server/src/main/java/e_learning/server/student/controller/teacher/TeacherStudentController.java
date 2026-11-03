package e_learning.server.student.controller.teacher;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.student.dto.*;
import e_learning.server.student.service.StudentManagementService;
import e_learning.server.student.service.StudentProfileService;
import e_learning.server.student.service.teacher.TeacherStudentLearningService;
import e_learning.server.user.entity.UserStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/v1/teacher/students")
@RequiredArgsConstructor
public class TeacherStudentController {
    private final StudentManagementService managementService;
    private final StudentProfileService profileService;
    private final TeacherStudentLearningService learningService;

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
                Long.valueOf(Objects.requireNonNull(jwt.getSubject())),
                search, accountStatus, classId, gradeId, noClass, page, size));
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

    @GetMapping("/{studentId}/learning-summary")
    public ApiResponse<StudentLearningSummaryResponse> learningSummary(
            @PathVariable Long studentId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(
                learningService.summary(studentId, Long.valueOf(Objects.requireNonNull(jwt.getSubject())))
        );
    }

    @GetMapping("/{studentId}/assignments")
    public ApiResponse<PageResponse<StudentAssignmentItemResponse>> assignments(
            @PathVariable Long studentId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(
                learningService.listAssignments(
                        studentId,
                        Long.valueOf(Objects.requireNonNull(jwt.getSubject())),
                        status, page, size
                )
        );
    }

    @GetMapping("/{studentId}/activity-sessions")
    public ApiResponse<PageResponse<StudentActivitySessionItemResponse>> activitySessions(
            @PathVariable Long studentId,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(
                learningService.listActivitySessions(
                        studentId,
                        Long.valueOf(Objects.requireNonNull(jwt.getSubject())),
                        mode, status, page, size
                )
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

    @PatchMapping("/{studentId}/profile")
    public ApiResponse<StudentDetailResponse> updateProfile(
            @PathVariable Long studentId,
            @Valid @RequestBody UpdateStudentProfileRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ApiResponse.success(
                profileService.updateForTeacher(
                        studentId,
                        Long.valueOf(Objects.requireNonNull(jwt.getSubject())),
                        request
                )
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
