package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.SaveAttemptAnswerRequest;
import e_learning.server.assessmentattempt.dto.response.SaveAttemptAnswerResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswer;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptAnswerMutation;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptAnswerMutationRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptAnswerRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Persists student answer drafts with request idempotency and answer-level optimistic locking. */
@Service
@RequiredArgsConstructor
public class AssessmentAttemptAnswerService {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptQuestionRepository attemptQuestionRepository;
    private final AssessmentAttemptAnswerRepository answerRepository;
    private final AssessmentAttemptAnswerMutationRepository mutationRepository;
    private final ObjectMapper objectMapper;

    /*
     * 1. Define transaction boundary and load the AssessmentAttempt.
     * 2. Verify student ownership, activeSessionId, attempt state and deadline.
     * 3. Verify attemptQuestionId belongs to the attempt.
     * 4. Calculate canonical payload hash.
     * 5. Resolve/replay idempotency using requestId and payload hash.
     * 6. Load the current AssessmentAttemptAnswer.
     * 7. Compare expectedRevision with the current answer revision.
     * 8. Validate answerPayload against the immutable question snapshot.
     * 9. Persist answer using optimistic locking (@Version).
     * 10. Persist idempotency mutation atomically.
     * 11. Update lastActivityAt.
     * 12. Return SaveAttemptAnswerResponse acknowledgement.
     *
     * Concurrency policy:
     * - No pessimistic lock.
     * - AssessmentAttemptAnswer.revision uses @Version.
     * - activeSessionId rejects stale/inactive sessions.
     * - Race conditions between autosave, submit, timeout and refresh
     *   are intentionally tolerated by the current product scope.
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

        validateAnswerPayload(attempt.getDocumentSnapshot(), attemptQuestion.getQuestionSnapshot(), request.answerPayload());

        Optional<AssessmentAttemptAnswer> existingAnswer =
                answerRepository.findByAttemptQuestionId(attemptQuestionId);
        validateExpectedRevision(existingAnswer, request.expectedRevision());

        AssessmentAttemptAnswer answer = existingAnswer.orElseGet(AssessmentAttemptAnswer::new);
        if (answer.getId() == null) answer.setAttemptQuestion(attemptQuestion);
        answer.setAnswerPayload(request.answerPayload());

        try {
            answerRepository.saveAndFlush(answer);
        } catch (ObjectOptimisticLockingFailureException exception) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_VERSION_CONFLICT);
        }

        AssessmentAttemptAnswerMutation mutation = new AssessmentAttemptAnswerMutation();
        mutation.setAttempt(attempt);
        mutation.setAttemptQuestion(attemptQuestion);
        mutation.setRequestId(request.requestId());
        mutation.setPayloadHash(payloadHash);
        mutation.setResultRevision(answer.getRevision());
        mutation.setSavedAt(answer.getSavedAt());
        mutationRepository.saveAndFlush(mutation);

        attempt.setLastActivityAt(answer.getSavedAt());
        return SaveAttemptAnswerResponse.map(request.requestId(), attemptQuestionId,
                answer.getRevision(), answer.getSavedAt(), LocalDateTime.now());
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

    private void validateExpectedRevision(Optional<AssessmentAttemptAnswer> existingAnswer, long expectedRevision) {
        long currentRevision = existingAnswer.map(AssessmentAttemptAnswer::getRevision).orElse(0L);
        if (currentRevision != expectedRevision) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_VERSION_CONFLICT);
        }
    }

    private void validateAnswerPayload(Map<String, Object> documentSnapshot,
                                       Map<String, Object> questionSnapshot,
                                       Map<String, Object> answerPayload) {
        if (answerPayload == null || !(questionSnapshot.get("student") instanceof Map<?, ?> student)
                || !(student.get("spec") instanceof Map<?, ?> spec)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        // Matching uses a stable Answer Pool entry ID in the student payload. Resolve the pool
        // from the immutable Attempt document snapshot; never trust a client-supplied pool or entry list.
        if ("MATCHING".equals(stringValue(spec.get("type")))) {
            validateMatchingAnswer(documentSnapshot, spec, answerPayload);
        }
        // Other question types still need their type-specific Question Engine adapter.
    }

    private void validateMatchingAnswer(Map<String, Object> documentSnapshot,
                                        Map<?, ?> spec,
                                        Map<String, Object> answerPayload) {
        Object poolIdValue = spec.get("poolId");
        String poolId = stringValue(poolIdValue);
        if (poolId.isBlank()) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        Object selectedValue = answerPayload.get("selectedKey");
        if (!(selectedValue instanceof String submittedEntryId)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
        String selectedEntryId = submittedEntryId.trim();

        // Empty selection represents an unanswered question. It is valid to save a draft.
        if (selectedEntryId.isEmpty()) return;

        List<?> blocks = documentSnapshot.get("blocks") instanceof List<?> list ? list : List.of();
        Map<?, ?> matchedPoolPayload = null;
        for (Object blockValue : blocks) {
            if (!(blockValue instanceof Map<?, ?> block) || !"POOL".equals(stringValue(block.get("itemType")))) {
                continue;
            }
            if (!(block.get("payload") instanceof Map<?, ?> payload)) continue;

            String logicalKey = stringValue(payload.get("poolKey"));
            String itemId = stringValue(block.get("assignmentItemId"));
            boolean matches = poolId.equals(logicalKey)
                    || (!itemId.isBlank() && (poolId.equals(itemId) || poolId.equals("b-" + itemId)));
            if (matches) {
                matchedPoolPayload = payload;
                break;
            }
        }

        if (matchedPoolPayload == null || !(matchedPoolPayload.get("entries") instanceof List<?> entries)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        boolean entryExists = entries.stream().anyMatch(entry ->
                entry instanceof Map<?, ?> entryMap
                        && selectedEntryId.equals(stringValue(entryMap.get("id"))));
        if (!entryExists) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
    }

    private String stringValue(Object value) {
        return value instanceof String text ? text.trim() : "";
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

            // Preserve array order; answers may depend on the position of each item.
            node.forEach(item -> array.add(canonicalize(item)));

            return array;
        }

        ObjectNode object = objectMapper.createObjectNode();
        java.util.TreeSet<String> sorted = new java.util.TreeSet<>();

        // Collect property names and sort them for deterministic JSON output.
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
