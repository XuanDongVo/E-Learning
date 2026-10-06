package e_learning.server.classes.controller;

import e_learning.server.classes.dto.ClassResponse;
import e_learning.server.classes.dto.CreateClassRequest;
import e_learning.server.classes.dto.UpdateClassRequest;
import e_learning.server.classes.service.ClassService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassResponse>>> list(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(classService.findByTeacher(Long.valueOf(jwt.getSubject())))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClassResponse>> create(
            @Valid @RequestBody CreateClassRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Class created",
                        classService.create(request, Long.valueOf(jwt.getSubject()))
                ));
    }

    @PutMapping("/{classId}")
    public ResponseEntity<ApiResponse<ClassResponse>> update(
            @PathVariable Long classId,
            @Valid @RequestBody UpdateClassRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Class updated",
                        classService.update(classId, request, Long.valueOf(jwt.getSubject()))
                )
        );
    }

    @PatchMapping("/{classId}/archive")
    public ResponseEntity<ApiResponse<ClassResponse>> archive(
            @PathVariable Long classId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Class archived",
                        classService.archive(classId, Long.valueOf(jwt.getSubject()))
                )
        );
    }
}
