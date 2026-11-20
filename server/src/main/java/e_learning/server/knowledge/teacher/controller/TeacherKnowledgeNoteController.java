package e_learning.server.knowledge.teacher.controller;

import e_learning.server.common.dto.PageResponse;
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
            @PathVariable Long id, @Valid @RequestBody SaveKnowledgeNoteContentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.saveContent(id, request)));
    }
}
