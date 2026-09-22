package e_learning.server.content.media.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.media.dto.MediaResponse;
import e_learning.server.content.media.enums.MediaType;
import e_learning.server.content.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/content")
@RequiredArgsConstructor
public class MediaController {

	private final MediaService mediaService;

	@PostMapping(value = "/media", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiResponse<MediaResponse>> upload(
			@RequestPart("file") MultipartFile file,
			@RequestParam MediaType mediaType
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Media uploaded", mediaService.upload(file, mediaType)));
	}

	@GetMapping("/media/{mediaId}")
	public ResponseEntity<ApiResponse<MediaResponse>> get(@PathVariable Long mediaId) {
		return ResponseEntity.ok(ApiResponse.success(mediaService.getResponse(mediaId)));
	}

	@PostMapping("/questions/{questionId}/media/{mediaId}")
	public ResponseEntity<ApiResponse<Void>> attach(
			@PathVariable Long questionId,
			@PathVariable Long mediaId,
			@RequestParam(required = false) Integer displayOrder
	) {
		mediaService.attachToQuestion(questionId, mediaId, displayOrder);
		return ResponseEntity.ok(ApiResponse.success("Media attached", null));
	}

	@DeleteMapping("/questions/{questionId}/media/{mediaId}")
	public ResponseEntity<ApiResponse<Void>> detach(
			@PathVariable Long questionId,
			@PathVariable Long mediaId
	) {
		mediaService.detachFromQuestion(questionId, mediaId);
		return ResponseEntity.ok(ApiResponse.success("Media detached", null));
	}

	@GetMapping("/questions/{questionId}/media")
	public ResponseEntity<ApiResponse<List<MediaResponse>>> listQuestionMedia(@PathVariable Long questionId) {
		return ResponseEntity.ok(ApiResponse.success(mediaService.getQuestionMedia(questionId)));
	}

	@DeleteMapping("/media/{mediaId}")
	public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long mediaId) {
		mediaService.markDeleted(mediaId);
		return ResponseEntity.ok(ApiResponse.success("Media deleted", null));
	}
}
