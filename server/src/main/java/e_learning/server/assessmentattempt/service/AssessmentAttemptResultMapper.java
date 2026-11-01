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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AssessmentAttemptResultMapper {
    private final AssessmentAttemptQuestionRepository questionRepository;
    private final AssessmentAttemptPartResultRepository partResultRepository;

    public AttemptResultResponse toResponse(AssessmentAttempt attempt) {
        boolean scoreVisible = settingFlag(
                attempt,
                AssessmentAttemptSnapshotContract.SETTINGS_SHOW_SCORE_AFTER_SUBMIT,
                true);
        boolean answersVisible = settingFlag(
                attempt,
                AssessmentAttemptSnapshotContract.SETTINGS_SHOW_ANSWERS_AFTER_SUBMIT,
                true);

        List<AssessmentAttemptQuestion> questions =
                questionRepository.findAllByAttemptIdOrderByPositionAsc(attempt.getId());
        List<AssessmentAttemptPartResult> parts =
                partResultRepository.findAllByAttemptQuestionAttemptIdOrderByAttemptQuestionPositionAscPartKeyAsc(
                        attempt.getId());

        Map<Long, List<AssessmentAttemptPartResult>> partsByQuestion = parts.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getAttemptQuestion().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

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

        return new AttemptResultResponse(
                attempt.getId(),
                attempt.getAssignment().getId(),
                attempt.getStatus(),
                attempt.getSubmittedAt(),
                attempt.getTimedOutAt(),
                attempt.isLate(),
                attempt.getTotalPossiblePoints(),
                scoreVisible ? attempt.getTotalEarnedPoints() : null,
                scoreVisible ? attempt.getPercentageScore() : null,
                scoreVisible,
                answersVisible,
                questionRows
        );
    }

    private static AttemptPartStatus rollup(
            List<AssessmentAttemptPartResult> parts,
            AssessmentAttemptQuestion question
    ) {
        if (question.isExample()) {
            return AttemptPartStatus.UNANSWERED;
        }
        if (parts.isEmpty()) {
            return isBlank(question.getAnswerPayload())
                    ? AttemptPartStatus.UNANSWERED
                    : AttemptPartStatus.INCORRECT;
        }

        boolean anyPartial = false;
        boolean anyCorrect = false;
        boolean anyIncorrect = false;
        boolean allUnanswered = true;

        for (AssessmentAttemptPartResult part : parts) {
            AttemptPartStatus status = part.getStatus();
            if (status != AttemptPartStatus.UNANSWERED) {
                allUnanswered = false;
            }
            switch (status) {
                case CORRECT -> anyCorrect = true;
                case PARTIALLY_CORRECT -> anyPartial = true;
                case INCORRECT -> anyIncorrect = true;
                case UNANSWERED -> { }
            }
        }

        if (allUnanswered) {
            return AttemptPartStatus.UNANSWERED;
        }
        if (anyPartial || (anyCorrect && anyIncorrect)) {
            return AttemptPartStatus.PARTIALLY_CORRECT;
        }
        if (anyCorrect) {
            return AttemptPartStatus.CORRECT;
        }
        return AttemptPartStatus.INCORRECT;
    }

    private static Object extractAnswerKey(Map<String, Object> snapshot) {
        if (snapshot == null) {
            return null;
        }
        Object grading = snapshot.get("grading");
        if (!(grading instanceof Map<?, ?> map)) {
            return null;
        }
        Map<String, Object> result = new LinkedHashMap<>();
        if (map.get("options") != null) {
            result.put("options", map.get("options"));
        }
        if (map.get("answers") != null) {
            result.put("answers", map.get("answers"));
        }
        if (map.get("explanation") != null) {
            result.put("explanation", map.get("explanation"));
        }
        return result.isEmpty() ? null : result;
    }

    private static boolean settingFlag(AssessmentAttempt attempt, String key, boolean defaultValue) {
        Map<String, Object> settings = attempt.getSettingsSnapshot();
        if (settings == null || !settings.containsKey(key)) {
            return defaultValue;
        }
        Object value = settings.get(key);
        if (value instanceof Boolean b) {
            return b;
        }
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private static boolean isBlank(Map<String, Object> payload) {
        return payload == null || payload.isEmpty();
    }
}
