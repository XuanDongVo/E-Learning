package e_learning.server.content.questionBank.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.common.dto.UpdateStatusRequest;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.question.repository.QuestionRepository;
import e_learning.server.content.questionBank.dto.CreateQuestionBankRequest;
import e_learning.server.content.questionBank.dto.QuestionBankResponse;
import e_learning.server.content.questionBank.dto.UpdateQuestionBankRequest;
import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.content.topic.entity.Topic;
import e_learning.server.content.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionBankService {
    private final QuestionBankRepository questionBankRepository;
    private final TopicRepository topicRepository;
    private final QuestionRepository questionRepository;

    @Transactional
    public QuestionBankResponse create(CreateQuestionBankRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

        if (questionBankRepository.existsByTopicIdAndNameIgnoreCase(request.getTopicId(), request.getName().trim())) {
            throw new AppException(ErrorCode.QUESTION_BANK_ALREADY_EXISTS);
        }

        int displayOrder = request.getDisplayOrder() != null
                ? request.getDisplayOrder()
                : questionBankRepository.findByTopicIdOrderByDisplayOrderAsc(request.getTopicId()).size() + 1;

        QuestionBank bank = QuestionBank.builder()
                .topic(topic)
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .displayOrder(displayOrder)
                .status(ContentStatus.DRAFT)
                .build();

        QuestionBank saved = questionBankRepository.save(bank);
        return mapToResponse(saved);
    }

    public QuestionBankResponse get(Long id) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));
        return mapToResponse(bank);
    }

    public List<QuestionBankResponse> list(Long topicId, boolean includeArchived) {
        topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

        List<QuestionBank> banks;
        if (includeArchived) {
            banks = questionBankRepository.findByTopicIdOrderByDisplayOrderAsc(topicId);
        } else {
            banks = questionBankRepository.findByTopicIdAndStatusInOrderByDisplayOrderAsc(
                    topicId, List.of(ContentStatus.DRAFT, ContentStatus.PUBLISHED));
        }

        return banks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public QuestionBankResponse update(Long id, UpdateQuestionBankRequest request) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        if (questionBankRepository.existsByTopicIdAndNameIgnoreCaseAndIdNot(
                bank.getTopic().getId(), request.getName().trim(), id)) {
            throw new AppException(ErrorCode.QUESTION_BANK_ALREADY_EXISTS);
        }

        bank.setName(request.getName().trim());
        bank.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        QuestionBank saved = questionBankRepository.save(bank);
        return mapToResponse(saved);
    }

    @Transactional
    public QuestionBankResponse updateStatus(Long id, UpdateStatusRequest request) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        bank.setStatus(request.status());
        QuestionBank saved = questionBankRepository.save(bank);
        return mapToResponse(saved);
    }

    @Transactional
    public QuestionBankResponse archive(Long id) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        bank.setStatus(ContentStatus.ARCHIVED);
        QuestionBank saved = questionBankRepository.save(bank);
        return mapToResponse(saved);
    }

    @Transactional
    public void reorder(Long topicId, ReorderRequest request) {
        topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

        List<QuestionBank> banks = questionBankRepository.findByTopicIdOrderByDisplayOrderAsc(topicId);
        Map<Long, QuestionBank> bankMap = banks.stream()
                .collect(Collectors.toMap(QuestionBank::getId, b -> b));

        request.items().forEach(item -> {
            QuestionBank bank = bankMap.get(item.id());
            if (bank != null) {
                bank.setDisplayOrder(item.displayOrder());
            }
        });

        questionBankRepository.saveAll(banks);
    }

    private QuestionBankResponse mapToResponse(QuestionBank bank) {
        long totalQuestions = questionRepository.countByQuestionBankId(bank.getId());
        long readyQuestions = questionRepository.countByQuestionBankIdAndCompleteTrue(bank.getId());

        return QuestionBankResponse.builder()
                .id(bank.getId())
                .topicId(bank.getTopic().getId())
                .topicName(bank.getTopic().getName())
                .name(bank.getName())
                .description(bank.getDescription())
                .displayOrder(bank.getDisplayOrder())
                .status(bank.getStatus())
                .totalQuestions(totalQuestions)
                .readyQuestions(readyQuestions)
                .createdAt(bank.getCreatedAt())
                .updatedAt(bank.getUpdatedAt())
                .build();
    }
}
