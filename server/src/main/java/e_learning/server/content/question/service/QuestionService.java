package e_learning.server.content.question.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.question.dto.*;
import e_learning.server.content.question.entity.ContentQuestion;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.content.questionBank.entity.QuestionBank;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.question.dto.response.QuestionContentResponse;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.guided.GuidedDefinitionService;
import e_learning.server.question.service.QuestionPersistenceService;
import e_learning.server.question.service.QuestionResponseMapper;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final ContentQuestionRepository contentQuestionRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionPersistenceService questionPersistenceService;
    private final GuidedDefinitionService guidedDefinitionService;
    private final QuestionResponseMapper questionResponseMapper;

    public PageResponse<QuestionResponse> getQuestions(Long questionBankId, String search, QuestionType type,
                                                       Difficulty difficulty, Boolean isComplete, int page, int size) {
        questionBankRepository.findById(questionBankId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size <= 0 ? 10 : size,
                Sort.by(Sort.Direction.DESC, "questionId"));

        Specification<ContentQuestion> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("questionBank").get("id"), questionBankId));
            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("question").get("content")),
                        "%" + search.trim().toLowerCase() + "%"));
            }
            if (type != null) predicates.add(cb.equal(root.get("question").get("type"), type));
            if (difficulty != null) predicates.add(cb.equal(root.get("question").get("difficulty"), difficulty));
            if (isComplete != null) predicates.add(cb.equal(root.get("question").get("complete"), isComplete));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ContentQuestion> pageResult = contentQuestionRepository.findAll(spec, pageable);
        List<QuestionResponse> responses = pageResult.getContent().stream()
                .map(cq -> toResponse(cq.getQuestion(), cq.getQuestionBank().getId()))
                .toList();
        return PageResponse.from(pageResult, responses);
    }

    public QuestionResponse getQuestion(Long id) {
        ContentQuestion contentQuestion = contentQuestionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        return toResponse(contentQuestion.getQuestion(), contentQuestion.getQuestionBank().getId());
    }

    @Transactional
    public List<QuestionResponse> createQuestion(List<CreateQuestionRequest> requests) {
        if (requests == null || requests.isEmpty()) throw new AppException(ErrorCode.EMPTY_QUESTION);
        for (CreateQuestionRequest request : requests) {
            questionBankRepository.findById(request.getQuestionBankId())
                    .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));
        }
        List<Question> questions = questionPersistenceService.createQuestions(requests);
        List<QuestionResponse> responses = new ArrayList<>(questions.size());
        for (int i = 0; i < questions.size(); i++) {
            responses.add(toResponse(questions.get(i), requests.get(i).getQuestionBankId()));
        }
        return responses;
    }

    /**
     * Bulk Composer save: Question and optional Guided draft commit atomically.
     */
    @Transactional
    public List<BulkCreateQuestionWithGuidedResponse> createQuestionsWithGuided(
            BulkCreateQuestionsWithGuidedRequest request) {
        List<BulkQuestionWithGuidedRequest> items = request.questions();
        List<CreateQuestionRequest> questionsToCreate = items.stream()
                .map(BulkQuestionWithGuidedRequest::question)
                .toList();

        for (CreateQuestionRequest question : questionsToCreate) {
            questionBankRepository.findById(question.getQuestionBankId())
                    .orElseThrow(() -> new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));
        }

        List<Question> created = questionPersistenceService.createQuestions(questionsToCreate);
        List<BulkCreateQuestionWithGuidedResponse> responses = new ArrayList<>(created.size());

        List<ContentQuestion> contentQuestions = new ArrayList<>(created.size());
        Long bankId = request.questions().getFirst().question().getQuestionBankId();
        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() ->new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND));

        for (int index = 0; index < created.size(); index++) {
            contentQuestions.add(
                    ContentQuestion.builder()
                            .question(created.get(index))
                            .questionBank(bank)
                            .build()
            );
        }
        contentQuestionRepository.saveAll(contentQuestions);

        for (int index = 0; index < created.size(); index++) {
            BulkQuestionWithGuidedRequest item = items.get(index);
            if (item.guidedDefinition() != null) {
                guidedDefinitionService.createDraftForNewQuestion(created.get(index), item.guidedDefinition());
            }
            responses.add(new BulkCreateQuestionWithGuidedResponse(
                    item.draftId(), toResponse(created.get(index), item.question().getQuestionBankId())));
        }
        return responses;
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, UpdateQuestionRequest request) {
        ContentQuestion contentQuestion = contentQuestionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        Question question = questionPersistenceService.updateQuestion(id, request);
        contentQuestion.setQuestion(question);
        return toResponse(question, contentQuestion.getQuestionBank().getId());
    }

    @Transactional
    public void deleteQuestion(BulkDeleteQuestionsRequest request) {
        var ids = new java.util.HashSet<>(request.ids());
        List<ContentQuestion> ownerships = contentQuestionRepository.findAllById(ids);
        if (ownerships.size() != ids.size()) throw new AppException(ErrorCode.QUESTION_NOT_FOUND);

        boolean allInBank = ownerships.stream().allMatch(cq ->
                cq.getQuestionBank().getId().equals(request.questionBankId()));
        if (!allInBank) throw new AppException(ErrorCode.QUESTION_NOT_IN_BANK);

        questionPersistenceService.deleteQuestions(ids);
    }

    private QuestionResponse toResponse(Question question, Long questionBankId) {
        QuestionContentResponse content = questionResponseMapper.toContentResponse(question);
        return QuestionResponse.builder()
                .id(content.getId()).questionBankId(questionBankId).type(content.getType())
                .difficulty(content.getDifficulty()).content(content.getContent()).explanation(content.getExplanation())
                .hint(content.getHint()).complete(content.isComplete()).matchingMode(content.getMatchingMode())
                .definition(content.getDefinition()).options(content.getOptions()).answers(content.getAnswers())
                .media(content.getMedia()).createdAt(content.getCreatedAt()).updatedAt(content.getUpdatedAt()).build();
    }
}
