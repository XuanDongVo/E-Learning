package e_learning.server.content.topic.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.topic.dto.CreateTopicRequest;
import e_learning.server.content.topic.dto.TopicResponse;
import e_learning.server.content.topic.dto.UpdateTopicRequest;
import e_learning.server.content.topic.service.TopicService;
import e_learning.server.content.common.dto.ReorderRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/content/topics")
@RequiredArgsConstructor
public class TopicController {
    private final TopicService topicService;

    @PostMapping
    public ResponseEntity<ApiResponse<TopicResponse>> create(@Valid @RequestBody CreateTopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Topic created successfully", topicService.create(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> get(@PathVariable Long id) { return ResponseEntity.ok(ApiResponse.success(topicService.get(id))); }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicResponse>>> list(@RequestParam Long sectionId, @RequestParam(defaultValue = "false") boolean includeArchived) {
        return ResponseEntity.ok(ApiResponse.success(topicService.list(sectionId, includeArchived)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicResponse>> update(@PathVariable Long id, @Valid @RequestBody UpdateTopicRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Topic updated successfully", topicService.update(id, request)));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<TopicResponse>> archive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Topic archived successfully", topicService.archive(id)));
    }

    @PutMapping("/order")
    public ResponseEntity<ApiResponse<Void>> reorder(@RequestParam Long sectionId, @Valid @RequestBody ReorderRequest request) {
        topicService.reorder(sectionId, request);
        return ResponseEntity.ok(ApiResponse.success("Topics reordered successfully", null));
    }
}
