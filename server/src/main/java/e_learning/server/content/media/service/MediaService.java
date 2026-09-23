package e_learning.server.content.media.service;

import e_learning.server.content.media.dto.MediaResponse;
import e_learning.server.content.media.entity.Media;
import e_learning.server.content.question.entity.QuestionMedia;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.enums.MediaType;
import e_learning.server.content.media.repository.MediaRepository;
import e_learning.server.content.question.repository.QuestionMediaRepository;
import e_learning.server.content.question.entity.Question;
import e_learning.server.content.question.repository.QuestionRepository;
import jakarta.persistence.EntityNotFoundException;
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

    public MediaResponse upload(
            MultipartFile file,
            MediaType mediaType
    ) {

        ValidatedMedia validated =
                validationService.validate(file, mediaType);

        Media media = Media.builder()
                .mediaType(validated.mediaType())
                .originalName(validated.originalName())
                .mimeType(validated.mimeType())
                .sizeBytes(validated.sizeBytes())
                .format(validated.extension())
                .status(MediaStatus.PENDING)
                .publicId(buildTemporaryPublicId())
                .resourceType(
                        mediaType == MediaType.IMAGE
                                ? "image"
                                : "video"
                )
                .build();

        mediaRepository.save(media);

        CloudinaryUploadResult uploaded = null;

        try {

            uploaded =
                    cloudinaryMediaService.upload(file, mediaType);

            media.setPublicId(uploaded.publicId());
            media.setResourceType(uploaded.resourceType());
            media.setFormat(uploaded.format());
            media.setSizeBytes(uploaded.bytes());

            media.setWidth(uploaded.width());
            media.setHeight(uploaded.height());
            media.setDurationSeconds(
                    uploaded.durationSeconds()
            );

            media.setStatus(MediaStatus.READY);

            mediaRepository.save(media);

            return toResponse(media);

        } catch (Exception ex) {

            media.setStatus(MediaStatus.FAILED);
            mediaRepository.save(media);

            // Best-effort cleanup if Cloudinary succeeded
            // but DB update failed afterwards.
            if (uploaded != null) {
                try {
                    cloudinaryMediaService.delete(
                            uploaded.publicId(),
                            uploaded.resourceType()
                    );
                } catch (Exception ignored) {
                    // Log this properly.
                }
            }

            throw ex;
        }
    }

    @Transactional
    public void attachToQuestion(
            Long questionId,
            Long mediaId,
            Integer displayOrder
    ) {

        Question question =
                questionRepository.findById(questionId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Question not found."
                                )
                        );

        Media media =
                mediaRepository.findById(mediaId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "Media not found."
                                )
                        );

        if (media.getStatus() != MediaStatus.READY) {
            throw new IllegalStateException(
                    "Only READY media can be attached."
            );
        }

        if (
                questionMediaRepository
                        .existsByQuestionIdAndMediaId(
                                questionId,
                                mediaId
                        )
        ) {
            return;
        }

        QuestionMedia questionMedia =
                QuestionMedia.builder()
                        .question(question)
                        .media(media)
                        .displayOrder(
                                displayOrder == null
                                        ? 0
                                        : displayOrder
                        )
                        .build();

        questionMediaRepository.save(questionMedia);
    }

    @Transactional
    public void detachFromQuestion(
            Long questionId,
            Long mediaId
    ) {

        questionMediaRepository
                .deleteByQuestionIdAndMediaId(
                        questionId,
                        mediaId
                );
    }

    @Transactional
    public void markDeleted(Long mediaId) {

        Media media = getMedia(mediaId);

        if (
                questionMediaRepository
                        .existsByMediaId(mediaId)
        ) {
            throw new IllegalStateException(
                    "Media is still being used by a question."
            );
        }

        media.setStatus(MediaStatus.DELETED);

        mediaRepository.save(media);

        // Do NOT depend on DB transaction to rollback
        // a Cloudinary deletion.
    }

    public Media getMedia(Long mediaId) {

        return mediaRepository.findById(mediaId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Media not found."
                        )
                );
    }

    public MediaResponse getResponse(Long mediaId) {

        return toResponse(getMedia(mediaId));
    }

    public List<MediaResponse> getQuestionMedia(
            Long questionId
    ) {

        return questionMediaRepository
                .findByQuestionIdOrderByDisplayOrderAsc(
                        questionId
                )
                .stream()
                .map(QuestionMedia::getMedia)
                .map(this::toResponse)
                .toList();
    }

    public void validateAttachable(Long mediaId) {

        Media media = getMedia(mediaId);

        if (media.getStatus() != MediaStatus.READY) {
            throw new IllegalStateException(
                    "Media is not ready."
            );
        }
    }

    private MediaResponse toResponse(Media media) {

        return new MediaResponse(
                media.getId(),
                media.getMediaType(),
                media.getOriginalName(),
                media.getFormat(),
                media.getMimeType(),
                media.getSizeBytes(),
                media.getWidth(),
                media.getHeight(),
                media.getDurationSeconds(),
                media.getStatus(),
                media.getStatus() == MediaStatus.READY
                        ? cloudinaryMediaService.generatedUrl(
                                media.getPublicId(),
                                media.getResourceType(),
                                media.getFormat()
                        )
                        : null
        );
    }

    private String buildTemporaryPublicId() {

        return "pending/" + UUID.randomUUID();
    }
}
