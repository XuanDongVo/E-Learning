package e_learning.server.classes.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.student.dto.AddClassMemberRequest;
import e_learning.server.student.dto.StudentSummaryResponse;
import e_learning.server.student.service.StudentManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/classes/{classId}/members")
@RequiredArgsConstructor
public class ClassMemberController {
    private final StudentManagementService service;

    @GetMapping
    public ApiResponse<List<StudentSummaryResponse>> list(@PathVariable Long classId,@AuthenticationPrincipal Jwt jwt){return ApiResponse.success(service.listClass(classId,Long.valueOf(jwt.getSubject())));}

    @PostMapping
    public ApiResponse<Void> add(@PathVariable Long classId,@Valid @RequestBody AddClassMemberRequest request,@AuthenticationPrincipal Jwt jwt){service.addToClass(classId,request.studentId(),Long.valueOf(jwt.getSubject()));return ApiResponse.success(null);}

    @PostMapping("/{studentId}/transfer")
    public ApiResponse<Void> transfer(@PathVariable Long classId, @PathVariable Long studentId, @AuthenticationPrincipal Jwt jwt) {
        service.transferToClass(classId, studentId, Long.valueOf(jwt.getSubject()));
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{studentId}")
    public ApiResponse<Void> remove(@PathVariable Long classId,@PathVariable Long studentId,@AuthenticationPrincipal Jwt jwt){service.removeFromClass(classId,studentId,Long.valueOf(jwt.getSubject()));return ApiResponse.success(null);}
}
