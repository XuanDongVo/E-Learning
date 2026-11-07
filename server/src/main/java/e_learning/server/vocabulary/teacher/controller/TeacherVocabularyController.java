package e_learning.server.vocabulary.teacher.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.vocabulary.teacher.dto.*;
import e_learning.server.vocabulary.teacher.service.TeacherVocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TeacherVocabularyController {

    private final TeacherVocabularyService teacherVocabularyService;

    @GetMapping("/v1/content/units/{unitId}/vocabulary")
    public ResponseEntity<ApiResponse<List<VocabularyWordResponse>>> getWordsByUnit(
            @PathVariable Long unitId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        List<VocabularyWordResponse> response = teacherVocabularyService.getWordsByUnit(unitId, status, search);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/v1/content/units/{unitId}/vocabulary")
    public ResponseEntity<ApiResponse<VocabularyWordResponse>> createWord(
            @PathVariable Long unitId,
            @Valid @RequestBody CreateVocabularyWordRequest request
    ) {
        VocabularyWordResponse response = teacherVocabularyService.createWord(unitId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm từ vựng thành công", response));
    }

    @PostMapping("/v1/content/units/{unitId}/vocabulary/bulk")
    public ResponseEntity<ApiResponse<List<VocabularyWordResponse>>> bulkCreateWords(
            @PathVariable Long unitId,
            @Valid @RequestBody BulkCreateVocabularyWordsRequest request
    ) {
        List<VocabularyWordResponse> response = teacherVocabularyService.bulkCreateWords(unitId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Nhập nhanh " + response.size() + " từ vựng thành công", response));
    }

    @PutMapping("/v1/content/units/{unitId}/vocabulary/order")
    public ResponseEntity<ApiResponse<Void>> reorderWords(
            @PathVariable Long unitId,
            @Valid @RequestBody ReorderVocabularyRequest request
    ) {
        teacherVocabularyService.reorderWords(unitId, request);
        return ResponseEntity.ok(ApiResponse.success("Sắp xếp thứ tự từ vựng thành công", null));
    }

    @GetMapping("/v1/content/vocabulary/{id}")
    public ResponseEntity<ApiResponse<VocabularyWordResponse>> getWordById(
            @PathVariable Long id
    ) {
        VocabularyWordResponse response = teacherVocabularyService.getWordById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/v1/content/vocabulary/{id}")
    public ResponseEntity<ApiResponse<VocabularyWordResponse>> updateWord(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVocabularyWordRequest request
    ) {
        VocabularyWordResponse response = teacherVocabularyService.updateWord(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật từ vựng thành công", response));
    }

    @PatchMapping("/v1/content/vocabulary/{id}/status")
    public ResponseEntity<ApiResponse<VocabularyWordResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWordStatusRequest request
    ) {
        VocabularyWordResponse response = teacherVocabularyService.updateWordStatus(id, request.status());
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", response));
    }

    @DeleteMapping("/v1/content/vocabulary/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWord(
            @PathVariable Long id
    ) {
        teacherVocabularyService.deleteWord(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa từ vựng thành công", null));
    }
}
