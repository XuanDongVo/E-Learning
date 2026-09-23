package e_learning.server.content.section.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.section.dto.CreateSectionRequest;
import e_learning.server.content.section.dto.SectionResponse;
import e_learning.server.content.section.dto.UpdateSectionRequest;
import e_learning.server.content.section.service.SectionService;
import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.common.dto.UpdateStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/content/sections")
@RequiredArgsConstructor
public class SectionController {
    private final SectionService sectionService;

    @PostMapping
    public ResponseEntity<ApiResponse<SectionResponse>> createSection(
            @Valid @RequestBody CreateSectionRequest request
    ) {
        SectionResponse response = sectionService.createSection(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Section created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SectionResponse>> getById(@PathVariable Long id) {
        SectionResponse response = sectionService.getById(id);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SectionResponse>>> getByUnit(@RequestParam Long unitId) {
        List<SectionResponse> response = sectionService.getByUnit(unitId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SectionResponse>> updateSection(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSectionRequest request
    ) {
        SectionResponse response = sectionService.updateSection(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Section updated successfully", response));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<SectionResponse>> archive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Section archived successfully", sectionService.archiveSection(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SectionResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Section status updated successfully", sectionService.updateStatus(id, request)));
    }

    @PutMapping("/order")
    public ResponseEntity<ApiResponse<Void>> reorder(@RequestParam Long unitId, @Valid @RequestBody ReorderRequest request) {
        sectionService.reorder(unitId, request);
        return ResponseEntity.ok(ApiResponse.success("Sections reordered successfully", null));
    }

}