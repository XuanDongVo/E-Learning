package e_learning.server.knowledge.student.controller;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.response.ApiResponse;
import e_learning.server.knowledge.student.dto.StudentKnowledgeNoteDetail;
import e_learning.server.knowledge.student.dto.StudentKnowledgeNoteSummary;
import e_learning.server.knowledge.student.service.StudentKnowledgeNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/v1/student/knowledge-notes")
@RequiredArgsConstructor
public class StudentKnowledgeNoteController {
    private final StudentKnowledgeNoteService service;

    @GetMapping
    public ApiResponse<PageResponse<StudentKnowledgeNoteSummary>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long unitId,
            @RequestParam(required = false) Long topicId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ApiResponse.success(service.list(studentId, search, unitId, topicId, page, size));
    }

    @GetMapping("/{noteId}")
    public ApiResponse<StudentKnowledgeNoteDetail> detail(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long noteId) {
        Long studentId = Long.valueOf(Objects.requireNonNull(jwt.getSubject()));
        return ApiResponse.success(service.get(studentId, noteId));
    }
}
