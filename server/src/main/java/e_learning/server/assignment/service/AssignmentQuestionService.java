package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.entity.AssignmentQuestion;
import e_learning.server.assignment.repository.AssignmentQuestionRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.entity.Question;
import e_learning.server.question.service.QuestionPersistenceService;
import e_learning.server.question.service.QuestionResponseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentQuestionService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;
    private final QuestionPersistenceService questionPersistenceService;
    private final QuestionResponseMapper questionResponseMapper;

    public List<AssignmentQuestionResponse> list(Long assignmentId) {
        findAssignment(assignmentId);

        return assignmentQuestionRepository.findAllByAssignmentId(assignmentId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<AssignmentQuestionResponse> create(
            Long assignmentId,
            List<CreateAssignmentQuestionRequest> requests
    ) {
        Assignment assignment = findAssignment(assignmentId);

        if (requests == null || requests.isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_QUESTION);
        }

        long currentCount = assignmentQuestionRepository.countByAssignmentId(assignmentId);
        if (currentCount + requests.size() > 100) {
            throw new AppException(ErrorCode.ASSIGNMENT_QUESTION_LIMIT_EXCEEDED);
        }

        List<Question> questions = questionPersistenceService.createQuestions(requests);
        List<AssignmentQuestion> ownerships = new ArrayList<>(questions.size());

        for (Question question : questions) {
            ownerships.add(AssignmentQuestion.builder()
                    .questionId(question.getId())
                    .question(question)
                    .assignment(assignment)
                    .build());
        }

        assignmentQuestionRepository.saveAll(ownerships);
        return ownerships.stream().map(this::toResponse).toList();
    }

    @Transactional
    public AssignmentQuestionResponse update(
            Long assignmentId,
            Long questionId,
            UpdateAssignmentQuestionRequest request
    ) {
        AssignmentQuestion ownership = findOwnership(assignmentId, questionId);
        Question question = questionPersistenceService.updateQuestion(questionId, request);
        ownership.setQuestion(question);
        return toResponse(ownership);
    }

    @Transactional
    public void bulkDelete(Long assignmentId, BulkDeleteAssignmentQuestionsRequest request) {
        findAssignment(assignmentId);

        Set<Long> ids = new HashSet<>(request.ids());
        List<AssignmentQuestion> ownerships =
                assignmentQuestionRepository.findAllByAssignmentIdAndQuestionIdIn(assignmentId, ids);

        if (ownerships.size() != ids.size()) {
            throw new AppException(ErrorCode.QUESTION_NOT_FOUND);
        }

        assignmentQuestionRepository.deleteAllInBatch(ownerships);
        questionPersistenceService.deleteQuestions(ids);
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
