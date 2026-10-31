package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.SaveAttemptAnswerRequest;
import e_learning.server.assessmentattempt.dto.response.SaveAttemptAnswerResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswerMutation;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptAnswerMutationRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assessmentattempt.validator.QuestionAnswerFormatValidator;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.enums.QuestionType;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Persists student answer drafts on {@link AssessmentAttemptQuestion} with request idempotency
 * and question-level optimistic locking ({@code revision}).
 */
@Service
@RequiredArgsConstructor
public class AssessmentAttemptAnswerService {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptQuestionRepository attemptQuestionRepository;
    private final AssessmentAttemptAnswerMutationRepository mutationRepository;
    private final ObjectMapper objectMapper;
    private final QuestionAnswerFormatValidator formatValidator;

    /*
     * 1. Load AssessmentAttempt; verify ownership, activeSessionId, state, deadline.
     * 2. Load AssessmentAttemptQuestion by id + attemptId.
     * 3. Canonical payload hash + requestId idempotency (Mutation).
     * 4. Validate expectedRevision against question.revision.
     * 5. Validate answerPayload against immutable student.spec in question_snapshot.
     * 6. Persist answer_payload + saved_at on the question (@Version revision).
     * 7. Persist Mutation; update attempt.lastActivityAt.
     *
     * Concurrency: no pessimistic lock; AssessmentAttemptQuestion.revision is @Version.
     * Normalized values are not stored on draft save (submit/grade path later).
     */
    @Transactional
    public SaveAttemptAnswerResponse saveAnswer(Long attemptId, Long attemptQuestionId, Long studentId,
                                                SaveAttemptAnswerRequest request) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND));

        verifyStudentOwnership(attempt, studentId);
        verifyActiveSession(attempt, request.activeSessionId());
        validateAnswerSavingAllowed(attempt);

        AssessmentAttemptQuestion attemptQuestion = attemptQuestionRepository
                .findByIdAndAttemptId(attemptQuestionId, attemptId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER));

        String payloadHash = calculateCanonicalPayloadHash(attemptId, attemptQuestionId, request.answerPayload());

        Optional<AssessmentAttemptAnswerMutation> existingMutation =
                mutationRepository.findByAttemptIdAndRequestId(attemptId, request.requestId());
        if (existingMutation.isPresent()) {
            AssessmentAttemptAnswerMutation mutation = existingMutation.get();
            if (!mutation.getPayloadHash().equals(payloadHash)) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_REQUEST_REPLAY);
            }
            return responseForOriginalMutation(mutation);
        }

        validateAnswerPayload(attemptQuestion.getQuestionSnapshot(), request.answerPayload());
        validateExpectedRevision(attemptQuestion.getRevision(), request.expectedRevision());

        LocalDateTime savedAt = LocalDateTime.now();
        attemptQuestion.setAnswerPayload(request.answerPayload());
        attemptQuestion.setSavedAt(savedAt);

        try {
            attemptQuestionRepository.saveAndFlush(attemptQuestion);
        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_VERSION_CONFLICT);
        }

        AssessmentAttemptAnswerMutation mutation = new AssessmentAttemptAnswerMutation();
        mutation.setAttempt(attempt);
        mutation.setAttemptQuestion(attemptQuestion);
        mutation.setRequestId(request.requestId());
        mutation.setPayloadHash(payloadHash);
        mutation.setResultRevision(attemptQuestion.getRevision());
        mutation.setSavedAt(savedAt);
        mutationRepository.saveAndFlush(mutation);

        attempt.setLastActivityAt(savedAt);
        return SaveAttemptAnswerResponse.map(request.requestId(), attemptQuestionId,
                attemptQuestion.getRevision(), savedAt, LocalDateTime.now());
    }

    private void verifyStudentOwnership(AssessmentAttempt attempt, Long studentId) {
        if (attempt.getStudent() == null || !attempt.getStudent().getId().equals(studentId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_ACCESS_DENIED);
        }
    }

    private void verifyActiveSession(AssessmentAttempt attempt, UUID activeSessionId) {
        if (attempt.getActiveSessionId() == null || !attempt.getActiveSessionId().equals(activeSessionId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_SESSION_LOST);
        }
    }

    private void validateAnswerSavingAllowed(AssessmentAttempt attempt) {
        if (attempt.getStatus() != AssessmentAttemptStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_STATE);
        }
        if (attempt.getDeadlineAt() != null && !LocalDateTime.now().isBefore(attempt.getDeadlineAt())) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_TIME_UP);
        }
    }

    private void validateExpectedRevision(long currentRevision, long expectedRevision) {
        if (currentRevision != expectedRevision) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_VERSION_CONFLICT);
        }
    }

    @SuppressWarnings("unchecked")
    private void validateAnswerPayload(Map<String, Object> questionSnapshot,
                                       Map<String, Object> answerPayload) {
        if (questionSnapshot == null || answerPayload == null) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        if (!(questionSnapshot.get("student") instanceof Map<?, ?> student)
                || !(student.get("spec") instanceof Map<?, ?> studentSpecMap)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        Map<String, Object> studentSpec = (Map<String, Object>) studentSpecMap;
        String typeStr = (String) studentSpec.get("type");
        if (typeStr == null) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        QuestionType questionType = QuestionType.valueOf(typeStr);
        formatValidator.validate(questionType, studentSpec, answerPayload);
    }

    private String calculateCanonicalPayloadHash(Long attemptId, Long attemptQuestionId, Map<String, Object> answerPayload) {
        try {
            ObjectNode canonical = objectMapper.createObjectNode();
            canonical.put("attemptId", attemptId);
            canonical.put("attemptQuestionId", attemptQuestionId);
            canonical.set("answerPayload", canonicalize(objectMapper.valueToTree(answerPayload)));
            return sha256(objectMapper.writeValueAsBytes(canonical));
        } catch (RuntimeException exception) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
    }

    private JsonNode canonicalize(JsonNode node) {
        if (node == null || node.isValueNode() || node.isNull()) {
            return node;
        }

        if (node.isArray()) {
            var array = objectMapper.createArrayNode();
            node.forEach(item -> array.add(canonicalize(item)));
            return array;
        }

        ObjectNode object = objectMapper.createObjectNode();
        java.util.TreeSet<String> sorted = new java.util.TreeSet<>();
        node.properties().forEach(entry -> sorted.add(entry.getKey()));
        for (String name : sorted) {
            object.set(name, canonicalize(node.get(name)));
        }
        return object;
    }

    private String sha256(byte[] value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value);
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte b : digest) result.append(String.format("%02x", b));
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private SaveAttemptAnswerResponse responseForOriginalMutation(AssessmentAttemptAnswerMutation mutation) {
        return SaveAttemptAnswerResponse.map(mutation.getRequestId(), mutation.getAttemptQuestion().getId(),
                mutation.getResultRevision(), mutation.getSavedAt(), LocalDateTime.now());
    }
}
