package e_learning.server.question.guided;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.question.guided.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/content")
public class GuidedDefinitionController {
    private final GuidedDefinitionService guidedDefinitionService;

    public GuidedDefinitionController(GuidedDefinitionService guidedDefinitionService) {
        this.guidedDefinitionService = guidedDefinitionService;
    }

    @GetMapping("/questions/{questionId}/guided")
    public ResponseEntity<ApiResponse<GuidedDefinitionResponse>> get(@PathVariable Long questionId) {
        return ResponseEntity.ok(ApiResponse.success(guidedDefinitionService.get(questionId)));
    }

    @PutMapping("/questions/{questionId}/guided")
    public ResponseEntity<ApiResponse<GuidedDefinitionResponse>> saveDraft(
            @PathVariable Long questionId, @Valid @RequestBody GuidedDefinitionUpsertRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Guided draft saved", guidedDefinitionService.saveDraft(questionId, request)));
    }

    @PostMapping("/questions/{questionId}/guided/validate")
    public ResponseEntity<ApiResponse<GuidedDefinitionValidationResponse>> validate(
            @PathVariable Long questionId, @Valid @RequestBody GuidedDefinitionValidateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(guidedDefinitionService.validateAndMarkReady(questionId, request)));
    }

    @DeleteMapping("/questions/{questionId}/guided")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long questionId) {
        guidedDefinitionService.delete(questionId);
        return ResponseEntity.ok(ApiResponse.success("Guided definition deleted", null));
    }

    @GetMapping("/guided/capabilities")
    public ResponseEntity<ApiResponse<GuidedCapabilitiesResponse>> capabilities() {
        return ResponseEntity.ok(ApiResponse.success(guidedDefinitionService.capabilities()));
    }
}
