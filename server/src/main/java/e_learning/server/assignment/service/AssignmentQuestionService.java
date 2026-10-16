package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.entity.AssignmentQuestion;
import e_learning.server.assignment.entity.AssignmentQuestionIdempotency;
import e_learning.server.assignment.repository.AssignmentQuestionRepository;
import e_learning.server.assignment.repository.AssignmentQuestionIdempotencyRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.entity.Question;
import e_learning.server.question.repository.QuestionRepository;
import e_learning.server.question.service.QuestionPersistenceService;
import e_learning.server.question.service.QuestionResponseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentQuestionService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;
    private final AssignmentQuestionIdempotencyRepository idempotencyRepository;
    private final QuestionRepository questionRepository;
    private final QuestionPersistenceService questionPersistenceService;
    private final QuestionResponseMapper questionResponseMapper;
    private final ObjectMapper objectMapper;

    public List<AssignmentQuestionResponse> list(Long assignmentId) {
        findAssignment(assignmentId);

        return assignmentQuestionRepository.findAllByAssignmentIdOrderByQuestionIdAsc(assignmentId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<AssignmentQuestionResponse> create(
            Long assignmentId,
            List<CreateAssignmentQuestionRequest> requests,
            String idempotencyKey
    ) {
        Assignment assignment = findAssignment(assignmentId);
        ensureEditable(assignment);

        if (requests == null || requests.isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_QUESTION);
        }
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            if (requests.size() != 1) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            return createIdempotent(assignment, requests.getFirst(), idempotencyKey.trim());
        }

        long currentCount = assignmentQuestionRepository.countByAssignmentId(assignmentId);
        if (currentCount + requests.size() > 100) {
            throw new AppException(ErrorCode.ASSIGNMENT_QUESTION_LIMIT_EXCEEDED);
        }

        List<Question> questions = questionPersistenceService.createQuestions(requests);
        List<AssignmentQuestion> ownerships = new ArrayList<>(questions.size());

        for (Question question : questions) {
            ownerships.add(AssignmentQuestion.builder()
                    .question(question)
                    .assignment(assignment)
                    .build());
        }

        assignmentQuestionRepository.saveAll(ownerships);

        return ownerships.stream().map(this::toResponse).toList();
    }

    private List<AssignmentQuestionResponse> createIdempotent(
            Assignment assignment,
            CreateAssignmentQuestionRequest request,
            String idempotencyKey
    ) {
        String requestHash = hash(request);
        Optional<AssignmentQuestionIdempotency> existing =
                idempotencyRepository.findByAssignmentIdAndIdempotencyKey(
                        assignment.getId(), idempotencyKey);
        if (existing.isPresent()) {
            AssignmentQuestionIdempotency record = existing.get();
            if (!record.getRequestHash().equals(requestHash)) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            return List.of(ensureOwnership(assignment, record.getQuestionId()));
        }

        List<Question> questions = questionPersistenceService.createQuestions(List.of(request));
        Question question = questions.getFirst();
        AssignmentQuestion ownership = AssignmentQuestion.builder()
                .question(question)
                .assignment(assignment)
                .build();
        assignmentQuestionRepository.save(ownership);
        idempotencyRepository.save(AssignmentQuestionIdempotency.builder()
                .assignmentId(assignment.getId())
                .idempotencyKey(idempotencyKey)
                .requestHash(requestHash)
                .questionId(question.getId())
                .build());
        return List.of(toResponse(ownership));
    }

    private AssignmentQuestionResponse ensureOwnership(Assignment assignment, Long questionId) {
        return toResponse(findOwnershipOrCreate(assignment, questionId));
    }

    private AssignmentQuestion findOwnershipOrCreate(Assignment assignment, Long questionId) {
        return assignmentQuestionRepository.findByAssignmentIdAndQuestionId(
                        assignment.getId(), questionId)
                .orElseGet(() -> {
                    Question question = questionRepository.findById(questionId)
                            .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
                    AssignmentQuestion ownership = AssignmentQuestion.builder()
                            .question(question)
                            .assignment(assignment)
                            .build();
                    return assignmentQuestionRepository.save(ownership);
                });
    }

    private String hash(CreateAssignmentQuestionRequest request) {
        try {
            byte[] payload = objectMapper.writeValueAsString(request)
                    .getBytes(StandardCharsets.UTF_8);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload));
        } catch (Exception error) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    @Transactional
    public AssignmentQuestionResponse update(
            Long assignmentId,
            Long questionId,
            UpdateAssignmentQuestionRequest request
    ) {
        Assignment assignment = findAssignment(assignmentId);
        ensureEditable(assignment);
        AssignmentQuestion ownership = findOwnershipOrCreate(assignment, questionId);
        Question question = questionPersistenceService.updateQuestion(questionId, request);
        ownership.setQuestion(question);
        return toResponse(ownership);
    }

    @Transactional
    public void bulkDelete(Long assignmentId, BulkDeleteAssignmentQuestionsRequest request) {
        Assignment assignment = findAssignment(assignmentId);
        ensureEditable(assignment);

        Set<Long> ids = new HashSet<>(request.ids());
        List<AssignmentQuestion> ownerships =
                assignmentQuestionRepository.findAllByAssignmentIdAndQuestionIdIn(assignmentId, ids);

        if (ownerships.size() != ids.size()) {
            throw new AppException(ErrorCode.QUESTION_NOT_FOUND);
        }

        assignmentQuestionRepository.deleteAllInBatch(ownerships);
        questionPersistenceService.deleteQuestions(ids);
    }

    private void ensureEditable(Assignment assignment) {
        if (assignment.getStatus() == e_learning.server.assignment.enums.AssignmentStatus.ARCHIVED) {
            throw new AppException(ErrorCode.ASSIGNMENT_QUESTIONS_LOCKED);
        }
    }

    private Assignment findAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }

    private AssignmentQuestion findOwnership(Long assignmentId, Long questionId) {
        return assignmentQuestionRepository.findByAssignmentIdAndQuestionId(assignmentId, questionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
    }

    private AssignmentQuestionResponse toResponse(AssignmentQuestion ownership) {
        return new AssignmentQuestionResponse(
                ownership.getQuestionId(),
                ownership.getAssignment().getId(),
                questionResponseMapper.toContentResponse(ownership.getQuestion())
        );
    }
}
