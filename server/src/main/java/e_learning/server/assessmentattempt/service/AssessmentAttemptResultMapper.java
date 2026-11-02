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
import java.time.LocalDateTime;
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
            Map<String, Object> snapshot = question.getQuestionSnapshot();
            Map<String, Object> answerKey = answersVisible ? extractAnswerKey(snapshot) : null;
            String explanation = answersVisible ? extractExplanation(snapshot) : null;
            BigDecimal responseEarned = scoreVisible ? earned : null;

            questionRows.add(new AttemptResultQuestionResponse(
                    question.getId(),
                    question.getAssignmentItem() == null ? null : question.getAssignmentItem().getId(),
                    question.getSourceQuestion() == null ? null : question.getSourceQuestion().getId(),
                    question.getPosition(),
                    question.getSectionKey(),
                    question.getSectionTitle(),
                    sectionTitleVi(attempt.getDocumentSnapshot(), question.getSectionKey()),
                    question.getPossiblePoints(),
                    responseEarned,
                    status,
                    question.isExample(),
                    studentQuestionSnapshot(snapshot),
                    question.getAnswerPayload(),
                    answerKey,
                    explanation
            ));
        }

        LocalDateTime finishedAt = attempt.getSubmittedAt() != null
                ? attempt.getSubmittedAt()
                : attempt.getTimedOutAt();
        String assignmentTitle = snapshotString(attempt.getDocumentSnapshot(), "assignmentTitle");

        return new AttemptResultResponse(
                attempt.getId(),
                attempt.getAssignment().getId(),
                assignmentTitle != null ? assignmentTitle : attempt.getAssignment().getName(),
                attempt.getStatus(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                attempt.getTimedOutAt(),
                finishedAt,
                attempt.getDeadlineAt(),
                attempt.getTimeLimitMinutes(),
                attempt.isLate(),
                attempt.getClassIdAtStart(),
                attempt.getClassNameAtStart(),
                attempt.getTotalPossiblePoints(),
                scoreVisible ? attempt.getTotalEarnedPoints() : null,
                scoreVisible ? attempt.getPercentageScore() : null,
                scoreVisible,
                answersVisible,
                attempt.getDocumentSnapshot(),
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

    private static Map<String, Object> extractAnswerKey(Map<String, Object> snapshot) {
        Map<String, Object> grading = snapshotMap(snapshot, "grading");
        if (grading == null) {
            return null;
        }
        Map<String, Object> result = new LinkedHashMap<>();
        if (grading.get("options") != null) {
            result.put("options", grading.get("options"));
        }
        if (grading.get("answers") != null) {
            result.put("answers", grading.get("answers"));
        }
        return result.isEmpty() ? null : result;
    }

    private static String extractExplanation(Map<String, Object> snapshot) {
        Map<String, Object> grading = snapshotMap(snapshot, "grading");
        if (grading == null) {
            return null;
        }
        return grading.get("explanation") instanceof String explanation
                ? explanation
                : null;
    }

    private static Map<String, Object> studentQuestionSnapshot(Map<String, Object> snapshot) {
        Map<String, Object> student = snapshotMap(snapshot, "student");
        if (student == null) {
            return Map.of();
        }
        Object spec = student.get("spec");
        if (spec instanceof Map<?, ?> map) {
            return toStringMap(map);
        }
        return Map.of();
    }

    private static String sectionTitleVi(Map<String, Object> document, String sectionKey) {
        if (document == null || sectionKey == null) {
            return null;
        }
        Object sections = document.get(AssessmentAttemptSnapshotContract.DOCUMENT_SECTIONS);
        if (!(sections instanceof List<?> sectionList)) {
            return null;
        }
        for (Object section : sectionList) {
            if (!(section instanceof Map<?, ?> sectionMap)) {
                continue;
            }
            if (sectionKey.equals(String.valueOf(sectionMap.get("id")))) {
                return sectionMap.get("titleVi") instanceof String titleVi ? titleVi : null;
            }
        }
        return null;
    }

    private static String snapshotString(Map<String, Object> snapshot, String key) {
        if (snapshot == null) {
            return null;
        }
        return snapshot.get(key) instanceof String value ? value : null;
    }

    private static Map<String, Object> snapshotMap(Map<String, Object> snapshot, String key) {
        if (snapshot == null) {
            return null;
        }
        Object value = snapshot.get(key);
        if (!(value instanceof Map<?, ?> map)) {
            return null;
        }
        return toStringMap(map);
    }

    private static Map<String, Object> toStringMap(Map<?, ?> source) {
        Map<String, Object> result = new LinkedHashMap<>();
        source.forEach((key, value) -> {
            if (key instanceof String text) {
                result.put(text, value);
            }
        });
        return result;
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
