package e_learning.server.content.knowledge.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.knowledge.dto.*;
import e_learning.server.content.knowledge.service.KnowledgeNoteTopicLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/content/topics/{topicId}/knowledge-notes")
@RequiredArgsConstructor
public class TeacherTopicKnowledgeNoteController {
    private final KnowledgeNoteTopicLinkService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KnowledgeNoteTopicLinkResponse>>> list(@PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.success(service.list(topicId)));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<KnowledgeNoteTopicLinkResponse>> attach(@PathVariable Long topicId, @Valid @RequestBody AttachKnowledgeNoteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.attach(topicId, request)));
    }
    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Void>> detach(@PathVariable Long topicId, @PathVariable Long noteId) {
        service.detach(topicId, noteId);
        return ResponseEntity.ok(ApiResponse.success((Void) null));
    }
    @PutMapping("/primary")
    public ResponseEntity<ApiResponse<Void>> primary(@PathVariable Long topicId, @Valid @RequestBody SetPrimaryKnowledgeNoteRequest request) {
        service.setPrimary(topicId, request);
        return ResponseEntity.ok(ApiResponse.success((Void) null));
    }
    @PutMapping("/order")
    public ResponseEntity<ApiResponse<Void>> order(@PathVariable Long topicId, @Valid @RequestBody ReorderKnowledgeNoteLinksRequest request) {
        service.reorder(topicId, request);
        return ResponseEntity.ok(ApiResponse.success((Void) null));
    }
}
