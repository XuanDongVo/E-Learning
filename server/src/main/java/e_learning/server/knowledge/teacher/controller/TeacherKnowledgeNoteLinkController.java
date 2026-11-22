package e_learning.server.knowledge.teacher.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.knowledge.teacher.dto.request.LinkKnowledgeNoteRequest;
import e_learning.server.knowledge.teacher.dto.request.ReorderTopicKnowledgeNotesRequest;
import e_learning.server.knowledge.teacher.dto.response.KnowledgeNoteTopicUsageResponse;
import e_learning.server.knowledge.teacher.dto.response.TopicKnowledgeNoteLinkResponse;
import e_learning.server.knowledge.teacher.service.TeacherKnowledgeNoteLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/teacher/knowledge-notes")
public class TeacherKnowledgeNoteLinkController {
    private final TeacherKnowledgeNoteLinkService service;

    @GetMapping("/topics/{topicId}/links")
    public ResponseEntity<ApiResponse<List<TopicKnowledgeNoteLinkResponse>>> forTopic(
            @PathVariable Long topicId) {
        return ResponseEntity.ok(ApiResponse.success(service.listForTopic(topicId)));
    }

    @PostMapping("/topics/{topicId}/links")
    public ResponseEntity<ApiResponse<List<TopicKnowledgeNoteLinkResponse>>> link(
            @PathVariable Long topicId, @Valid @RequestBody LinkKnowledgeNoteRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                service.link(topicId, request.noteId(), request.primary())));
    }

    @DeleteMapping("/topics/{topicId}/links/{noteId}")
    public ResponseEntity<ApiResponse<List<TopicKnowledgeNoteLinkResponse>>> unlink(
            @PathVariable Long topicId, @PathVariable Long noteId) {
        return ResponseEntity.ok(ApiResponse.success(service.unlink(topicId, noteId)));
    }

    @PutMapping("/topics/{topicId}/supplementary-order")
    public ResponseEntity<ApiResponse<List<TopicKnowledgeNoteLinkResponse>>> reorder(
            @PathVariable Long topicId, @Valid @RequestBody ReorderTopicKnowledgeNotesRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                service.reorderSupplementary(topicId, request.noteIds())));
    }

    @GetMapping("/{noteId}/topics")
    public ResponseEntity<ApiResponse<List<KnowledgeNoteTopicUsageResponse>>> forNote(
            @PathVariable Long noteId) {
        return ResponseEntity.ok(ApiResponse.success(service.listForNote(noteId)));
    }
}
