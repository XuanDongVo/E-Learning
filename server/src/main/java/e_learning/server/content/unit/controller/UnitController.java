package e_learning.server.content.unit.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.unit.dto.CreateUnitRequest;
import e_learning.server.content.unit.dto.UnitResponse;
import e_learning.server.content.unit.dto.UpdateUnitRequest;
import e_learning.server.content.unit.service.UnitService;
import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.common.dto.UpdateStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/content/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @PostMapping
    public ResponseEntity<ApiResponse<UnitResponse>> create(
            @Valid @RequestBody CreateUnitRequest request
    ) {
        UnitResponse response = unitService.createUnit(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Unit created successfully",
                                response
                        )
                );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> getById(
            @PathVariable Long id
    ) {
        UnitResponse response = unitService.getById(id);

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitResponse>>> getByGrade(
            @RequestParam Long gradeId
    ) {
        List<UnitResponse> response =
                unitService.getByGrade(gradeId);

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUnitRequest request
    ) {
        UnitResponse response =
                unitService.updateUnit(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Unit updated successfully",
                        response
                )
        );
    }

        @PatchMapping("/{id}/archive")
        public ResponseEntity<ApiResponse<UnitResponse>> archive(@PathVariable Long id) {
                return ResponseEntity.ok(ApiResponse.success("Unit archived successfully", unitService.archiveUnit(id)));
        }

        @PatchMapping("/{id}/status")
        public ResponseEntity<ApiResponse<UnitResponse>> updateStatus(
                @PathVariable Long id,
                @Valid @RequestBody UpdateStatusRequest request
        ) {
                return ResponseEntity.ok(ApiResponse.success("Unit status updated successfully", unitService.updateStatus(id, request)));
        }

        @PutMapping("/order")
        public ResponseEntity<ApiResponse<Void>> reorder(@RequestParam Long gradeId, @Valid @RequestBody ReorderRequest request) {
                unitService.reorder(gradeId, request);
                return ResponseEntity.ok(ApiResponse.success("Units reordered successfully", null));
        }

}