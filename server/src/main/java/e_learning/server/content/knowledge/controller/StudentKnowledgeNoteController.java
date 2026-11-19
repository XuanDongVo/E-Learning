package e_learning.server.content.knowledge.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.knowledge.dto.*;
import e_learning.server.content.knowledge.service.StudentKnowledgeNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class StudentKnowledgeNoteController {
    private final StudentKnowledgeNoteService service;

    @GetMapping("/v1/student/knowledge-notes")
    public ResponseEntity<ApiResponse<KnowledgeNotePageResponse<StudentKnowledgeNoteListItemResponse>>> list(
        @RequestParam(required = false) Long gradeId,
        @RequestParam(required = false) Long unitId,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size
    ) { return ResponseEntity.ok(ApiResponse.success(service.list(gradeId, unitId, search, page, size))); }

    @GetMapping("/v1/student/knowledge-notes/{id}")
    public ResponseEntity<ApiResponse<StudentKnowledgeNoteResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.get(id)));
    }
    @GetMapping("/v1/student/topics/{topicId}/knowledge-notes")
    public ResponseEntity<ApiResponse<StudentTopicKnowledgeNotesResponse>> topic(@PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.success(service.topic(topicId)));
    }
}
