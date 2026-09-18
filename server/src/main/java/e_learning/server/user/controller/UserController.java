package e_learning.server.user.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.user.dto.CreateStudentRequest;
import e_learning.server.user.dto.UserResponse;
import e_learning.server.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<UserResponse>> createStudent(
            @Valid @RequestBody CreateStudentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student account created", userService.createStudent(request)));
    }
}