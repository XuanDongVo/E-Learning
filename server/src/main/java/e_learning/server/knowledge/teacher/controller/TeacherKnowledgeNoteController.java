package e_learning.server.knowledge.teacher.controller;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.type.TypeReference;
import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import e_learning.server.knowledge.teacher.dto.request.CreateKnowledgeNoteRequest;
import e_learning.server.knowledge.teacher.dto.request.SaveKnowledgeNoteContentRequest;
import e_learning.server.knowledge.teacher.dto.response.KnowledgeNoteContentResponse;
import e_learning.server.knowledge.teacher.dto.response.KnowledgeNoteResponse;
import e_learning.server.knowledge.teacher.service.TeacherKnowledgeNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/teacher/knowledge-notes")
@RequiredArgsConstructor
public class TeacherKnowledgeNoteController {
    private final TeacherKnowledgeNoteService service;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> create(
            @Valid @RequestBody CreateKnowledgeNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(service.create(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<KnowledgeNoteResponse>>> list(
            @RequestParam(required = false) Long gradeId,
            @RequestParam(required = false) KnowledgeNoteStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean linked,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                service.list(gradeId, status, search, linked, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.get(id)));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<ApiResponse<KnowledgeNoteContentResponse>> getContent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getContent(id)));
    }

    @PutMapping("/{id}/content")
    public ResponseEntity<ApiResponse<KnowledgeNoteContentResponse>> saveContent(
            @PathVariable Long id, @RequestBody JsonNode payload) {
        // Reject stale v2 clients sending Summary/schemaVersion rather than silently discarding fields.
        if (payload == null || !payload.isObject() || payload.size() != 1
                || !payload.has("document") || !payload.get("document").isObject()) {
            throw new AppException(ErrorCode.KNOWLEDGE_NOTE_CONTENT_INVALID,
                    "Yêu cầu chỉ được chứa trường document. Hãy tải lại Editor phiên bản mới.");
        }
        var document = objectMapper.convertValue(payload.get("document"),
                new TypeReference<java.util.Map<String, Object>>() {});
        return ResponseEntity.ok(ApiResponse.success(
                service.saveContent(id, new SaveKnowledgeNoteContentRequest(document))));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> publish(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.publish(id)));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> unpublish(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.unpublish(id)));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> archive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.archive(id)));
    }
}
