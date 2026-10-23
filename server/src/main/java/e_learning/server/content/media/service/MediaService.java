package e_learning.server.content.media.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.media.dto.MediaResponse;
import e_learning.server.content.media.entity.Media;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.enums.MediaType;
import e_learning.server.content.media.repository.MediaRepository;
import e_learning.server.question.entity.QuestionMedia;
import e_learning.server.question.entity.Question;
import e_learning.server.question.repository.QuestionMediaRepository;
import e_learning.server.question.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {
    private final MediaRepository mediaRepository;
    private final QuestionMediaRepository questionMediaRepository;
    private final QuestionRepository questionRepository;
    private final MediaValidationService validationService;
    private final CloudinaryMediaService cloudinaryMediaService;

    public MediaResponse upload(MultipartFile file, MediaType mediaType) {
        ValidatedMedia validated = validationService.validate(file, mediaType);
        Media media = buildPendingMedia(validated, mediaType);
        mediaRepository.save(media);
        CloudinaryUploadResult uploaded = null;
        try {
            uploaded = cloudinaryMediaService.upload(file, mediaType);
            applyUploadResult(media, uploaded);
            media.setStatus(MediaStatus.READY);
            mediaRepository.save(media);
            return toResponse(media);
        } catch (RuntimeException ex) {
            markUploadFailed(media, uploaded);
            throw ex;
        }
    }

    @Transactional
    public MediaResponse uploadForQuestionDraft(MultipartFile file, MediaType mediaType) {
        ValidatedMedia validated = validationService.validate(file, mediaType);
        Media media = buildPendingMedia(validated, mediaType);
        mediaRepository.save(media);
        CloudinaryUploadResult uploaded = null;
        try {
            uploaded = cloudinaryMediaService.upload(file, mediaType);
            applyUploadResult(media, uploaded);
            mediaRepository.save(media);
            return toResponseWithUrl(media);
        } catch (RuntimeException ex) {
            markUploadFailed(media, uploaded);
            throw ex;
        }
    }

    @Transactional
    public void attachToQuestion(Long questionId, Long mediaId, Integer displayOrder) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        Media media = getMedia(mediaId);
        validateAttachable(media);
        if (questionMediaRepository.existsByQuestionIdAndMediaId(questionId, mediaId)) return;
        QuestionMedia questionMedia = QuestionMedia.builder()
                .question(question).media(media).displayOrder(displayOrder == null ? 0 : displayOrder).build();
        questionMediaRepository.save(questionMedia);
    }

    @Transactional
    public void detachFromQuestion(Long questionId, Long mediaId) {
        questionMediaRepository.deleteByQuestionIdAndMediaId(questionId, mediaId);
    }

    @Transactional
    public void markDeleted(Long mediaId) {
        Media media = getMedia(mediaId);
        if (questionMediaRepository.existsByMediaId(mediaId))
            throw new AppException(ErrorCode.MEDIA_ALREADY_IN_USE);
        media.setStatus(MediaStatus.DELETED);
        mediaRepository.save(media);
    }

    public Media getMedia(Long mediaId) {
        return mediaRepository.findById(mediaId)
                .orElseThrow(() -> new AppException(ErrorCode.MEDIA_NOT_FOUND));
    }

    public MediaResponse getResponse(Long mediaId) {
        return toResponse(getMedia(mediaId));
    }

    public List<MediaResponse> getQuestionMedia(Long questionId) {
        return questionMediaRepository.findByQuestionIdOrderByDisplayOrderAsc(questionId)
                .stream().map(QuestionMedia::getMedia).map(this::toResponse).toList();
    }

    public void validateAttachable(Long mediaId) {
        validateAttachable(getMedia(mediaId));
    }

    private void validateAttachable(Media media) {
        if (media.getStatus() != MediaStatus.READY) throw new AppException(ErrorCode.MEDIA_NOT_READY);
    }

    private Media buildPendingMedia(ValidatedMedia validated, MediaType mediaType) {
        return Media.builder().mediaType(validated.mediaType()).originalName(validated.originalName())
                .mimeType(validated.mimeType()).sizeBytes(validated.sizeBytes()).format(validated.extension())
                .status(MediaStatus.PENDING).publicId(buildTemporaryPublicId())
                .resourceType(mediaType == MediaType.IMAGE ? "image" : "video").build();
    }

    private void applyUploadResult(Media media, CloudinaryUploadResult uploaded) {
        media.setPublicId(uploaded.publicId());
        media.setResourceType(uploaded.resourceType());
        media.setFormat(uploaded.format());
        media.setSizeBytes(uploaded.bytes());
        media.setWidth(uploaded.width());
        media.setHeight(uploaded.height());
        media.setDurationSeconds(uploaded.durationSeconds());
    }

    private void markUploadFailed(Media media, CloudinaryUploadResult uploaded) {
        media.setStatus(MediaStatus.FAILED);
        mediaRepository.save(media);
        if (uploaded != null) {
            try {
                cloudinaryMediaService.delete(uploaded.publicId(), uploaded.resourceType());
            } catch (RuntimeException ignored) {
                // Cleanup failure must not hide the original upload failure.
            }
        }
    }

    private MediaResponse toResponse(Media media) {
        return new MediaResponse(media.getId(), media.getMediaType(), media.getOriginalName(), media.getFormat(),
                media.getMimeType(), media.getSizeBytes(), media.getWidth(), media.getHeight(), media.getDurationSeconds(),
                media.getStatus(), media.getStatus() == MediaStatus.READY
                        ? cloudinaryMediaService.generatedUrl(media.getPublicId(), media.getResourceType(), media.getFormat()) : null);
    }

    private MediaResponse toResponseWithUrl(Media media) {
        String url = null;
        if (media.getPublicId() != null && !media.getPublicId().startsWith("pending/")) {
            url = cloudinaryMediaService.generatedUrl(media.getPublicId(), media.getResourceType(), media.getFormat());
        }
        return new MediaResponse(media.getId(), media.getMediaType(), media.getOriginalName(), media.getFormat(),
                media.getMimeType(), media.getSizeBytes(), media.getWidth(), media.getHeight(), media.getDurationSeconds(),
                media.getStatus(), url);
    }

    private String buildTemporaryPublicId() {
        return "pending/" + UUID.randomUUID();
    }
}
