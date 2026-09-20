package e_learning.server.grades.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.grades.dto.CreateGradeRequest;
import e_learning.server.grades.dto.GradeResponse;
import e_learning.server.grades.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/grades")
@RequiredArgsConstructor
public class GradeController {
    private final GradeService gradeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GradeResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(gradeService.findActive()));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<GradeResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(gradeService.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GradeResponse>> create(@Valid @RequestBody CreateGradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Grade created", gradeService.createGrade(request)));
    }

    @PatchMapping("/{gradeId}")
    public ResponseEntity<ApiResponse<GradeResponse>> update(@PathVariable Long gradeId,
                                                           @Valid @RequestBody CreateGradeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Grade updated", gradeService.updateGrade(gradeId, request)));
    }

    @PatchMapping("/{gradeId}/inactive")
    public ResponseEntity<ApiResponse<GradeResponse>> inactive(@PathVariable Long gradeId) {
        return ResponseEntity.ok(ApiResponse.success("Grade deactivated", gradeService.inactiveGrade(gradeId)));
    }

    @PatchMapping("/{gradeId}/activate")
    public ResponseEntity<ApiResponse<GradeResponse>> activate(@PathVariable Long gradeId) {
        return ResponseEntity.ok(ApiResponse.success("Grade activated", gradeService.activateGrade(gradeId)));
    }

    @DeleteMapping("/{gradeId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long gradeId) {
        gradeService.deleteGrade(gradeId);
        return ResponseEntity.ok(ApiResponse.success("Grade deleted", null));
    }
}