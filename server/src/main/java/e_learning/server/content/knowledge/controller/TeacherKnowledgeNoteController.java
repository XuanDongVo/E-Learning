package e_learning.server.content.knowledge.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.knowledge.dto.*;
import e_learning.server.content.knowledge.service.KnowledgeNoteAuthoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** Routes are intentionally wired but return 501 until business phases are implemented. */
@RestController
@RequestMapping("/v1/content/knowledge-notes")
@RequiredArgsConstructor
public class TeacherKnowledgeNoteController {
    private final KnowledgeNoteAuthoringService service;

    @GetMapping
    public ResponseEntity<ApiResponse<KnowledgeNotePageResponse<KnowledgeNoteResponse>>> list(
        @RequestParam(required = false) Long gradeId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean linked,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) { return ResponseEntity.ok(ApiResponse.success(service.list(gradeId, status, search, linked, page, size))); }

    @PostMapping
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> create(@Valid @RequestBody CreateKnowledgeNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(request)));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.get(id)));
    }
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeNoteResponse>> update(@PathVariable Long id, @Valid @RequestBody UpdateKnowledgeNoteMetadataRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.updateMetadata(id, request)));
    }
    @GetMapping("/{id}/draft")
    public ResponseEntity<ApiResponse<KnowledgeNoteDraftResponse>> getDraft(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getDraft(id)));
    }
    @PutMapping("/{id}/draft")
    public ResponseEntity<ApiResponse<KnowledgeNoteDraftResponse>> saveDraft(@PathVariable Long id, @Valid @RequestBody SaveKnowledgeNoteDraftRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.saveDraft(id, request)));
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
    @GetMapping("/{id}/revisions")
    public ResponseEntity<ApiResponse<List<KnowledgeNoteRevisionResponse>>> revisions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.revisions(id)));
    }
    @GetMapping("/{id}/topic-links")
    public ResponseEntity<ApiResponse<List<KnowledgeNoteTopicLinkResponse>>> links(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.links(id)));
    }
}
