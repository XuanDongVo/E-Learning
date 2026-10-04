package e_learning.server.question.service;

import e_learning.server.question.dto.QuestionAnswerResponse;
import e_learning.server.question.dto.QuestionContentResponse;
import e_learning.server.question.dto.QuestionMediaResponse;
import e_learning.server.question.dto.QuestionOptionResponse;
import e_learning.server.question.entity.Question;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionMediaRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QuestionResponseMapper {

    private final QuestionOptionRepository questionOptionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final QuestionMediaRepository questionMediaRepository;

    public QuestionContentResponse toContentResponse(Question question) {
        return QuestionContentResponse.builder()
                .id(question.getId())
                .type(question.getType())
                .difficulty(question.getDifficulty())
                .content(question.getContent())
                .explanation(question.getExplanation())
                .complete(question.isComplete())
                .matchingMode(question.getMatchingMode())
                .options(questionOptionRepository.findByQuestionId(question.getId()).stream()
                        .map(o -> QuestionOptionResponse.builder()
                                .id(o.getId())
                                .content(o.getContent())
                                .correct(o.isCorrect())
                                .build())
                        .toList())
                .answers(questionAnswerRepository.findByQuestionId(question.getId()).stream()
                        .map(a -> QuestionAnswerResponse.builder()
                                .id(a.getId())
                                .rawValue(a.getRawValue())
                                .normalizedValue(a.getNormalizedValue())
                                .build())
                        .toList())
                .media(questionMediaRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId()).stream()
                        .map(m -> QuestionMediaResponse.builder()
                                .id(m.getId())
                                .mediaId(m.getMedia() != null ? m.getMedia().getId() : null)
                                .mediaType(m.getMedia() != null && m.getMedia().getMediaType() != null
                                        ? m.getMedia().getMediaType().name() : null)
                                .url(m.getMedia() != null ? m.getMedia().getPublicId() : null)
                                .build())
                        .toList())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
