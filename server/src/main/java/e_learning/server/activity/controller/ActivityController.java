package e_learning.server.activity.controller;

import e_learning.server.activity.dto.request.*;
import e_learning.server.activity.dto.response.*;
import e_learning.server.activity.service.ActivityService;
import e_learning.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/activities")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> list(
        @RequestParam Long unitId,
        @RequestParam(defaultValue = "false") boolean includeArchived) {
        return ResponseEntity.ok(ApiResponse.success(activityService.listByUnit(unitId, includeArchived)));
    }

    @GetMapping("/sources")
    public ResponseEntity<ApiResponse<List<ActivitySourceOptionResponse>>> sources(@RequestParam Long unitId) {
        return ResponseEntity.ok(ApiResponse.success(activityService.sourceOptions(unitId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.get(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityResponse>> create(@Valid @RequestBody CreateActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("Activity created successfully", activityService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityResponse>> update(
        @PathVariable Long id, @Valid @RequestBody UpdateActivityRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            "Activity updated successfully", activityService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ActivityResponse>> updateStatus(
        @PathVariable Long id, @Valid @RequestBody UpdateActivityStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            "Activity status updated successfully", activityService.updateStatus(id, request)));
    }

    @GetMapping("/{id}/readiness")
    public ResponseEntity<ApiResponse<ActivityReadinessResponse>> readiness(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.readiness(id)));
    }

    @PostMapping("/{id}/preview")
    public ResponseEntity<ApiResponse<ActivityPreviewResponse>> preview(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(activityService.preview(id)));
    }
}
