package e_learning.server.student.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.student.dto.StudentProfileResponse;
import e_learning.server.student.dto.UpdateStudentProfileRequest;
import e_learning.server.student.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/student/profile")
@RequiredArgsConstructor
public class StudentProfileController {
    private final StudentProfileService service;

    @GetMapping
    public ApiResponse<StudentProfileResponse> get(@AuthenticationPrincipal Jwt jwt){return ApiResponse.success(service.getOwnProfile(Long.valueOf(jwt.getSubject())));}

    @PutMapping
    public ApiResponse<StudentProfileResponse> update(@AuthenticationPrincipal Jwt jwt,@Valid @RequestBody UpdateStudentProfileRequest request){return ApiResponse.success(service.updateOwnProfile(Long.valueOf(jwt.getSubject()),request));}
}
