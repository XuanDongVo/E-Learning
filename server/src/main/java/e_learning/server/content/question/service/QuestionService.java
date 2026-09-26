package e_learning.server.content.question.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.Difficulty;
import e_learning.server.content.common.enums.QuestionType;
import e_learning.server.content.question.dto.*;
import e_learning.server.content.question.entity.Question;
import e_learning.server.content.question.entity.QuestionAnswer;
import e_learning.server.content.question.entity.QuestionMedia;
import e_learning.server.content.question.entity.QuestionOption;
import e_learning.server.content.question.repository.QuestionAnswerRepository;
import e_learning.server.content.question.repository.QuestionMediaRepository;
import e_learning.server.content.question.repository.QuestionOptionRepository;
import e_learning.server.content.question.repository.QuestionRepository;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final QuestionMediaRepository questionMediaRepository;

    public PageResponse<QuestionResponse> getQuestions(
            Long questionBankId,
            String search,
            QuestionType type,
            Difficulty difficulty,
            Boolean isComplete,
            int page,
            int size
    ) {
        questionBankRepository.findById(questionBankId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        int pageNum = Math.max(0, page - 1); // 1-indexed to 0-indexed
        int pageSize = size <= 0 ? 10 : size;

        Pageable pageable = PageRequest.of(pageNum, pageSize, Sort.by(Sort.Direction.DESC, "id"));

        Specification<Question> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("questionBank").get("id"), questionBankId));

            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("content")), "%" + search.trim().toLowerCase() + "%"));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }

            if (isComplete != null) {
                predicates.add(cb.equal(root.get("complete"), isComplete));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Question> questionPage = questionRepository.findAll(spec, pageable);

        List<QuestionResponse> responses = questionPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.from(questionPage, responses);
    }

    public QuestionResponse getQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        return mapToResponse(question);
    }

    private QuestionResponse mapToResponse(Question question) {
        List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());
        List<QuestionAnswer> answers = questionAnswerRepository.findByQuestionId(question.getId());
        List<QuestionMedia> mediaList = questionMediaRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId());

        List<QuestionOptionResponse> optionResponses = options.stream()
                .map(opt -> QuestionOptionResponse.builder()
                        .id(opt.getId())
                        .content(opt.getContent())
                        .isCorrect(opt.isCorrect())
                        .build())
                .collect(Collectors.toList());

        List<QuestionAnswerResponse> answerResponses = answers.stream()
                .map(ans -> QuestionAnswerResponse.builder()
                        .id(ans.getId())
                        .rawValue(ans.getRawValue())
                        .normalizedValue(ans.getNormalizedValue())
                        .build())
                .collect(Collectors.toList());

        List<QuestionMediaResponse> mediaResponses = mediaList.stream()
                .map(m -> QuestionMediaResponse.builder()
                        .id(m.getId())
                        .mediaId(m.getMedia() != null ? m.getMedia().getId() : null)
                        .mediaType(m.getMedia() != null && m.getMedia().getMediaType() != null ? m.getMedia().getMediaType().name() : null)
                        .url(m.getMedia() != null ? m.getMedia().getPublicId() : null)
                        .build())
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId())
                .questionBankId(question.getQuestionBank().getId())
                .type(question.getType())
                .difficulty(question.getDifficulty())
                .content(question.getContent())
                .explanation(question.getExplanation())
                .complete(question.isComplete())
                .matchingMode(question.getMatchingMode())
                .options(optionResponses)
                .answers(answerResponses)
                .media(mediaResponses)
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
