package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.AssessmentAttemptSnapshotContract;
import e_learning.server.assessmentattempt.dto.response.AttemptResultQuestionResponse;
import e_learning.server.assessmentattempt.dto.response.AttemptResultResponse;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptPartResult;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AttemptPartStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptPartResultRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AssessmentAttemptResultMapper {
    private final AssessmentAttemptQuestionRepository questionRepository;
    private final AssessmentAttemptPartResultRepository partResultRepository;

    public AttemptResultResponse toResponse(AssessmentAttempt attempt) {
        boolean scoreVisible = settingFlag(attempt, AssessmentAttemptSnapshotContract.SETTINGS_SHOW_SCORE_AFTER_SUBMIT, true);
        boolean answersVisible = settingFlag(attempt, AssessmentAttemptSnapshotContract.SETTINGS_SHOW_ANSWERS_AFTER_SUBMIT, true);

        List<AssessmentAttemptQuestion> questions =
                questionRepository.findAllByAttemptIdOrderByPositionAsc(attempt.getId());
        List<AssessmentAttemptPartResult> parts =
                partResultRepository.findAllByAttemptQuestionAttemptIdOrderByAttemptQuestionPositionAscPartKeyAsc(
                        attempt.getId());

        Map<Long, List<AssessmentAttemptPartResult>> partsByQuestion = parts.stream()
                .collect(Collectors.groupingBy(p -> p.getAttemptQuestion().getId(), LinkedHashMap::new, Collectors.toList()));

        List<AttemptResultQuestionResponse> questionRows = new ArrayList<>();
        for (AssessmentAttemptQuestion question : questions) {
            List<AssessmentAttemptPartResult> questionParts =
                    partsByQuestion.getOrDefault(question.getId(), List.of());

            BigDecimal earned = questionParts.stream()
                    .map(AssessmentAttemptPartResult::getEarnedPoints)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            AttemptPartStatus status = rollup(questionParts, question);

            Object answerKey = answersVisible ? extractAnswerKey(question.getQuestionSnapshot()) : null;
            BigDecimal responseEarned = scoreVisible ? earned : null;
            BigDecimal responsePossible = scoreVisible || true ? question.getPossiblePoints() : null;

            questionRows.add(new AttemptResultQuestionResponse(
                    question.getId(),
                    question.getPosition(),
                    question.getPossiblePoints(),
                    responseEarned,
                    status,
                    question.getAnswerPayload(),
                    answerKey
            ));
        }

        BigDecimal totalEarned = scoreVisible ? attempt.getTotalEarnedPoints() : null;
        BigDecimal percentage = scoreVisible ? attempt.getPercentageScore() : null;

        return new AttemptResultResponse(
                attempt.getId(),
                attempt.getAssignment().getId(),
                attempt.getStatus(),
                attempt.getSubmittedAt(),
                attempt.getTimedOutAt(),
                attempt.isLate(),
                attempt.getTotalPossiblePoints(),
                totalEarned,
                percentage,
                scoreVisible,
                answersVisible,
                questionRows
        );
    }

    private static AttemptPartStatus rollup(List<AssessmentAttemptPartResult> parts, AssessmentAttemptQuestion question) {
        if (question.isExample()) {
            return AttemptPartStatus.UNANSWERED;
        }
        if (parts.isEmpty()) {
            return isBlank(question.getAnswerPayload()) ? AttemptPartStatus.UNANSWERED : AttemptPartStatus.INCORRECT;
        }
        boolean anyPartial = false;
        boolean anyIncorrect = false;
        boolean allUnanswered = true;
        boolean allCorrect = true;
        for (AssessmentAttemptPartResult part : parts) {
            AttemptPartStatus status = part.getStatus();
            if (status != AttemptPartStatus.UNANSWERED) allUnanswered = false;
            if (status != AttemptPartStatus.CORRECT) allCorrect = false;
            if (status == AttemptPartStatus.PARTIALLY_CORRECT) anyPartial = true;
            if (status == AttemptPartStatus.INCORRECT) anyIncorrect = true;
        }
        if (allUnanswered) return AttemptPartStatus.UNANSWERED;
        if (allCorrect) return AttemptPartStatus.CORRECT;
        if (anyPartial || (anyIncorrect && !allCorrect && !allUnanswered && parts.stream()
                .anyMatch(p -> p.getStatus() == AttemptPartStatus.CORRECT))) {
            return AttemptPartStatus.PARTIALLY_CORRECT;
        }
        return AttemptPartStatus.INCORRECT;
    }

    @SuppressWarnings("unchecked")
    private static Object extractAnswerKey(Map<String, Object> snapshot) {
        if (snapshot == null) return null;
        Object grading = snapshot.get("grading");
        if (!(grading instanceof Map<?, ?> map)) return null;
        Map<String, Object> result = new LinkedHashMap<>();
        Object options = map.get("options");
        Object answers = map.get("answers");
        Object explanation = map.get("explanation");
        if (options != null) result.put("options", options);
        if (answers != null) result.put("answers", answers);
        if (explanation != null) result.put("explanation", explanation);
        return result.isEmpty() ? null : result;
    }

    private static boolean settingFlag(AssessmentAttempt attempt, String key, boolean defaultValue) {
        Map<String, Object> settings = attempt.getSettingsSnapshot();
        if (settings == null || !settings.containsKey(key)) return defaultValue;
        Object value = settings.get(key);
        if (value instanceof Boolean b) return b;
        if (value == null) return defaultValue;
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private static boolean isBlank(Map<String, Object> payload) {
        return payload == null || payload.isEmpty();
    }
}
