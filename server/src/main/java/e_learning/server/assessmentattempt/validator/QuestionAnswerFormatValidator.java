package e_learning.server.assessmentattempt.validator;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.enums.QuestionType;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class QuestionAnswerFormatValidator {

    public void validate(QuestionType type, Map<String, Object> studentSpec, Map<String, Object> answerPayload) {
        if (answerPayload == null) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        switch (type) {
            case SINGLE_CHOICE -> validateSingleChoice(studentSpec, answerPayload);
            case MULTIPLE_CHOICE -> validateMultipleChoice(studentSpec, answerPayload);
            case TRUE_FALSE -> validateTrueFalse(answerPayload);
            case FILL_IN_BLANK, TYPE_ANSWER -> validateTextAnswer(answerPayload);
            case CLOZE -> validateCloze(studentSpec, answerPayload);
            case MATCHING -> validateMatching(answerPayload);
            default -> throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
    }

    private void validateSingleChoice(Map<String, Object> studentSpec, Map<String, Object> payload) {
        Object selected = payload.get("selectedKey");
        if (selected == null) return; // Cho phép gửi null/unanswered khi autosave
        if (!(selected instanceof String key)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
        if (key.isBlank()) return;

        Set<String> validKeys = extractChoiceKeys(studentSpec);
        if (!validKeys.contains(key.trim().toUpperCase(Locale.ROOT))) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
    }

    private void validateMultipleChoice(Map<String, Object> studentSpec, Map<String, Object> payload) {
        Object selected = payload.get("selectedKeys");
        if (selected == null) return;
        if (!(selected instanceof List<?> list)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        Set<String> validKeys = extractChoiceKeys(studentSpec);
        Set<String> chosenKeys = new HashSet<>();

        for (Object item : list) {
            if (!(item instanceof String key) || key.isBlank()) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
            }
            String normalizedKey = key.trim().toUpperCase(Locale.ROOT);
            if (!validKeys.contains(normalizedKey) || !chosenKeys.add(normalizedKey)) {
                // Key không tồn tại hoặc gửi trùng key
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
            }
        }
    }

    private void validateTrueFalse(Map<String, Object> payload) {
        Object val = payload.get("value");
        if (val == null) return;
        if (!(val instanceof Boolean)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
    }

    private void validateTextAnswer(Map<String, Object> payload) {
        Object val = payload.get("value");
        if (val == null) return;
        if (!(val instanceof String)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
    }

    private void validateCloze(Map<String, Object> studentSpec, Map<String, Object> payload) {
        Object valuesObj = payload.get("values");
        if (valuesObj == null) return;
        if (!(valuesObj instanceof Map<?, ?> valuesMap)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }

        Set<String> validBlankKeys = extractBlankKeys(studentSpec);
        for (Map.Entry<?, ?> entry : valuesMap.entrySet()) {
            if (!(entry.getKey() instanceof String blankKey) || !(entry.getValue() instanceof String)) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
            }
            if (!validBlankKeys.contains(blankKey.trim())) {
                throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
            }
        }
    }

    private void validateMatching(Map<String, Object> payload) {
        Object selected = payload.get("selectedKey");
        if (selected == null) return;
        if (!(selected instanceof String)) {
            throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_INVALID_ANSWER);
        }
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractChoiceKeys(Map<String, Object> studentSpec) {
        Object choicesObj = studentSpec.get("choices");
        if (!(choicesObj instanceof List<?> choices)) return Set.of();
        Set<String> keys = new HashSet<>();
        for (Object c : choices) {
            if (c instanceof Map<?, ?> map && map.get("key") instanceof String k) {
                keys.add(k.trim().toUpperCase(Locale.ROOT));
            }
        }
        return keys;
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractBlankKeys(Map<String, Object> studentSpec) {
        Object blanksObj = studentSpec.get("blanks");
        if (!(blanksObj instanceof List<?> blanks)) return Set.of();
        Set<String> keys = new HashSet<>();
        for (Object b : blanks) {
            if (b instanceof Map<?, ?> map && map.get("key") instanceof String k) {
                keys.add(k.trim());
            }
        }
        return keys;
    }
}
