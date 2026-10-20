package e_learning.server.content.questionBank.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.common.dto.UpdateStatusRequest;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.content.questionBank.dto.CreateQuestionBankRequest;
import e_learning.server.content.questionBank.dto.GlobalQuestionBankResponse;
import e_learning.server.content.questionBank.dto.QuestionBankResponse;
import e_learning.server.content.questionBank.dto.UpdateQuestionBankRequest;
import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.content.topic.entity.Topic;
import e_learning.server.content.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionBankService {
    private final QuestionBankRepository questionBankRepository;
    private final TopicRepository topicRepository;
    private final ContentQuestionRepository contentQuestionRepository;

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

    public PageResponse<GlobalQuestionBankResponse> browse(
            Long gradeId,
            Long unitId,
            Long sectionId,
            Long topicId,
            String search,
            boolean includeArchived,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(safePage - 1, safeSize,
                Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id")));

        Specification<QuestionBank> specification = (root, query, cb) -> {
            Join<Object, Object> topic = root.join("topic", JoinType.INNER);
            Join<Object, Object> section = topic.join("section", JoinType.INNER);
            Join<Object, Object> unit = section.join("unit", JoinType.INNER);
            Join<Object, Object> grade = unit.join("grade", JoinType.INNER);
            var predicates = cb.conjunction();

            if (!includeArchived) {
                predicates = cb.and(predicates, root.get("status").in(ContentStatus.DRAFT, ContentStatus.PUBLISHED));
            }
            if (gradeId != null) predicates = cb.and(predicates, cb.equal(grade.get("id"), gradeId));
            if (unitId != null) predicates = cb.and(predicates, cb.equal(unit.get("id"), unitId));
            if (sectionId != null) predicates = cb.and(predicates, cb.equal(section.get("id"), sectionId));
            if (topicId != null) predicates = cb.and(predicates, cb.equal(topic.get("id"), topicId));
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates = cb.and(predicates, cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            return predicates;
        };

        Page<QuestionBank> bankPage = questionBankRepository.findAll(specification, pageable);
        List<QuestionBank> banks = bankPage.getContent();
        Map<Long, long[]> counts = new HashMap<>();
        if (!banks.isEmpty()) {
            Collection<Long> bankIds = banks.stream().map(QuestionBank::getId).toList();
            for (Object[] row : contentQuestionRepository.countQuestionTotalsByBankIds(bankIds)) {
                counts.put((Long) row[0], new long[]{
                        ((Number) row[1]).longValue(),
                        row[2] == null ? 0L : ((Number) row[2]).longValue()
                });
            }
        }

        List<GlobalQuestionBankResponse> responses = banks.stream().map(bank -> {
            var topic = bank.getTopic();
            var section = topic.getSection();
            var unit = section.getUnit();
            var grade = unit.getGrade();
            long[] total = counts.getOrDefault(bank.getId(), new long[]{0L, 0L});
            return new GlobalQuestionBankResponse(
                    bank.getId(), bank.getName(), bank.getDescription(), bank.getStatus(),
                    bank.getDisplayOrder(), bank.getCreatedAt(), bank.getUpdatedAt(),
                    topic.getId(), topic.getName(), section.getId(), section.getName(),
                    unit.getId(), unit.getCode(), unit.getName(), grade.getId(), grade.getName(),
                    total[0], total[1]
            );
        }).toList();

        return PageResponse.from(bankPage, responses);
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
        long totalQuestions = contentQuestionRepository.countByQuestionBankId(bank.getId());
        long readyQuestions = contentQuestionRepository.countByQuestionBankIdAndQuestionCompleteTrue(bank.getId());

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
