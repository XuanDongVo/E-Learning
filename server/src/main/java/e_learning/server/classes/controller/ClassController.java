package e_learning.server.classes.controller;

import e_learning.server.classes.dto.ClassResponse;
import e_learning.server.classes.dto.CreateClassRequest;
import e_learning.server.classes.service.ClassService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassResponse>>> list(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(ApiResponse.success(classService.findByTeacher(Long.valueOf(jwt.getSubject()))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClassResponse>> create(@Valid @RequestBody CreateClassRequest request, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Class created", classService.create(request, Long.valueOf(jwt.getSubject()))));
    }
}