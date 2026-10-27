package e_learning.server.assessmentattempt.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import e_learning.server.assessmentattempt.AssessmentAttemptSnapshotContract;
import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.entity.AssessmentAttemptQuestion;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptQuestionRepository;
import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import e_learning.server.assignment.entity.*;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.*;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.entity.ClassStatus;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.question.entity.Question;
import e_learning.server.question.entity.QuestionAnswer;
import e_learning.server.question.entity.QuestionOption;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.question.repository.QuestionRepository;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentAttemptCreationService {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptQuestionRepository attemptQuestionRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSectionRepository sectionRepository;
    private final AssignmentItemRepository itemRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuestionAnswerRepository questionAnswerRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Long createAttempt(Long assignmentId, Long studentId, UUID activeSessionId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
        if (assignment.getStatus() != AssignmentStatus.PUBLISHED) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }
        if (assignment.getStartAt() != null && LocalDateTime.now().isBefore(assignment.getStartAt())) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }
        if (assignment.getTimeLimitMinutes() == null || assignment.getTimeLimitMinutes() <= 0) {
            throw new AppException(ErrorCode.ASSIGNMENT_TIME_LIMIT_INVALID);
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        if (student.getRole() != Role.STUDENT || student.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        ClassMember membership = classMemberRepository.findActiveMembershipByUserId(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS));
        if (membership.getClassEntity().getStatus() != ClassStatus.ACTIVE) {
            throw new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS);
        }
        Long classId = membership.getClassEntity().getId();
        if (assignment.getClassIds() == null || assignment.getClassIds().stream().noneMatch(id -> Objects.equals(id, classId))) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }

        List<AssignmentSection> sections = sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignmentId);
        List<AssignmentItem> items = itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId);
        List<AssignmentItem> questions = orderedQuestions(sections, items);
        if (sections.isEmpty() || questions.isEmpty()) throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);

        Map<Long, Map<String, Object>> snapshotsByItem = new HashMap<>();
        Set<Long> seenQuestionIds = new HashSet<>();
        for (AssignmentItem item : questions) {
            Long questionId = item.getQuestionId();
            if (questionId == null || !seenQuestionIds.add(questionId)) {
                throw new AppException(ErrorCode.ASSIGNMENT_COMPOSITION_INVALID);
            }
            if (assignmentQuestionRepository.findByAssignmentIdAndQuestionId(assignmentId, questionId).isEmpty()) {
                throw new AppException(ErrorCode.ASSIGNMENT_COMPOSITION_INVALID);
            }
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
            if (!question.isComplete()) throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
            snapshotsByItem.put(item.getId(), questionSnapshot(question));
        }

        LocalDateTime startedAt = LocalDateTime.now();
        int timeLimitMinutes = assignment.getTimeLimitMinutes();
        Map<String, Object> settings = settingsSnapshot(assignment, timeLimitMinutes);
        Map<String, Object> document = documentSnapshot(assignment, sections, items);

        BigDecimal possible = questions.stream()
                .filter(item -> !item.isExample())
                .map(AssignmentItem::getPossiblePoints)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.setAssignment(assignment);
        attempt.setStudent(student);
        attempt.setClassIdAtStart(classId);
        attempt.setClassNameAtStart(membership.getClassEntity().getName());
        attempt.setStatus(AssessmentAttemptStatus.IN_PROGRESS);
        attempt.setStartedAt(startedAt);
        attempt.setTimeLimitMinutes(timeLimitMinutes);
        attempt.setDeadlineAt(startedAt.plusMinutes(timeLimitMinutes));
        attempt.setActiveSessionId(activeSessionId);
        attempt.setLastActivityAt(startedAt);
        attempt.setLate(false);
        attempt.setDocumentSnapshot(document);
        attempt.setSettingsSnapshot(settings);
        attempt.setSnapshotVersion(AssessmentAttemptSnapshotContract.CURRENT_VERSION);
        attempt.setTotalPossiblePoints(possible);
        attempt.setTotalEarnedPoints(BigDecimal.ZERO);
        attemptRepository.saveAndFlush(attempt);

        List<AssessmentAttemptQuestion> rows = new ArrayList<>();
        for (int index = 0; index < questions.size(); index++) {
            AssignmentItem item = questions.get(index);
            AssessmentAttemptQuestion row = new AssessmentAttemptQuestion();
            row.setAttempt(attempt);
            row.setAssignmentItem(item);
            row.setSourceQuestion(questionRepository.getReferenceById(item.getQuestionId()));
            row.setSectionKey(String.valueOf(item.getSection().getId()));
            row.setSectionTitle(item.getSection().getTitle());
            row.setPosition(index);
            row.setQuestionSnapshot(snapshotsByItem.get(item.getId()));
            row.setPossiblePoints(item.getPossiblePoints() == null ? BigDecimal.ZERO : item.getPossiblePoints());
            row.setRequired(false);
            row.setExample(item.isExample());
            row.setSnapshotVersion(AssessmentAttemptSnapshotContract.CURRENT_VERSION);
            rows.add(row);
        }
        attemptQuestionRepository.saveAllAndFlush(rows);
        return attempt.getId();
    }

    private List<AssignmentItem> orderedQuestions(List<AssignmentSection> sections, List<AssignmentItem> items) {
        Map<Long, List<AssignmentItem>> children = items.stream().filter(i -> i.getParentItem() != null)
                .collect(Collectors.groupingBy(i -> i.getParentItem().getId()));
        Map<Long, List<AssignmentItem>> roots = items.stream().filter(i -> i.getParentItem() == null)
                .collect(Collectors.groupingBy(i -> i.getSection().getId()));
        List<AssignmentItem> result = new ArrayList<>();
        for (AssignmentSection section : sections) {
            roots.getOrDefault(section.getId(), List.of()).stream().sorted(itemOrder())
                    .forEach(root -> collectQuestions(root, children, result));
        }
        return result;
    }

    private void collectQuestions(AssignmentItem item, Map<Long, List<AssignmentItem>> children, List<AssignmentItem> result) {
        if ("QUESTION".equals(item.getItemType())) result.add(item);
        children.getOrDefault(item.getId(), List.of()).stream().sorted(itemOrder())
                .forEach(child -> collectQuestions(child, children, result));
    }

    private Map<String, Object> documentSnapshot(Assignment assignment, List<AssignmentSection> sections, List<AssignmentItem> items) {
        Map<Long, List<AssignmentItem>> children = items.stream().filter(i -> i.getParentItem() != null)
                .collect(Collectors.groupingBy(i -> i.getParentItem().getId()));
        Map<Long, List<AssignmentItem>> roots = items.stream().filter(i -> i.getParentItem() == null)
                .collect(Collectors.groupingBy(i -> i.getSection().getId()));
        List<Map<String, Object>> sectionRows = new ArrayList<>();
        List<Map<String, Object>> blocks = new ArrayList<>();
        List<Map<String, Object>> questionRefs = new ArrayList<>();
        for (AssignmentSection section : sections) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("id", section.getId());
            s.put("position", section.getPosition());
            s.put("title", section.getTitle());
            s.put("titleVi", section.getTitleVi());
            s.put("instructions", section.getInstructions());
            s.put("instructionsVi", section.getInstructionsVi());
            List<Map<String, Object>> itemRows = roots.getOrDefault(section.getId(), List.of()).stream()
                    .sorted(itemOrder()).map(item -> itemSnapshot(item, section, children, blocks, questionRefs)).toList();
            s.put(AssessmentAttemptSnapshotContract.DOCUMENT_ITEMS, itemRows);
            sectionRows.add(s);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put(AssessmentAttemptSnapshotContract.DOCUMENT_VERSION, AssessmentAttemptSnapshotContract.CURRENT_VERSION);
        result.put("assignmentId", assignment.getId());
        result.put("assignmentTitle", assignment.getName());
        result.put("gradeName", assignment.getGrade().getName());
        result.put("compositionSchemaVersion", assignment.getCompositionSchemaVersion());
        result.put(AssessmentAttemptSnapshotContract.DOCUMENT_SECTIONS, sectionRows);
        result.put(AssessmentAttemptSnapshotContract.DOCUMENT_BLOCKS, blocks);
        result.put(AssessmentAttemptSnapshotContract.DOCUMENT_QUESTIONS, questionRefs);
        return result;
    }

    private Map<String, Object> itemSnapshot(AssignmentItem item, AssignmentSection section,
            Map<Long, List<AssignmentItem>> children, List<Map<String, Object>> blocks,
            List<Map<String, Object>> questionRefs) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", item.getId());
        row.put("position", item.getPosition());
        row.put("itemType", item.getItemType());
        row.put("questionId", item.getQuestionId());
        row.put("possiblePoints", item.getPossiblePoints());
        row.put("example", item.isExample());
        row.put("blockPayload", item.getBlockPayload());
        if ("QUESTION".equals(item.getItemType())) {
            Map<String, Object> ref = new LinkedHashMap<>();
            ref.put("assignmentItemId", item.getId());
            ref.put("questionId", item.getQuestionId());
            ref.put("sectionKey", String.valueOf(section.getId()));
            ref.put("sectionTitle", section.getTitle());
            questionRefs.add(ref);
        } else {
            Map<String, Object> block = new LinkedHashMap<>();
            block.put("assignmentItemId", item.getId());
            block.put("itemType", item.getItemType());
            block.put("sectionId", section.getId());
            block.put("parentItemId", item.getParentItem() == null ? null : item.getParentItem().getId());
            block.put("position", item.getPosition());
            block.put("payload", item.getBlockPayload());
            blocks.add(block);
        }
        row.put("children", children.getOrDefault(item.getId(), List.of()).stream().sorted(itemOrder())
                .map(child -> itemSnapshot(child, section, children, blocks, questionRefs)).toList());
        return row;
    }

    private Map<String, Object> settingsSnapshot(Assignment assignment, int minutes) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put(AssessmentAttemptSnapshotContract.SETTINGS_TIME_LIMIT_MINUTES, minutes);
        result.put("start_at", assignment.getStartAt() == null ? null : assignment.getStartAt().toString());
        result.put("due_at", assignment.getDueAt().toString());
        result.put(AssessmentAttemptSnapshotContract.SETTINGS_SHOW_SCORE_AFTER_SUBMIT, assignment.isShowScoreAfterSubmit());
        result.put(AssessmentAttemptSnapshotContract.SETTINGS_SHOW_ANSWERS_AFTER_SUBMIT, assignment.isShowAnswersAfterSubmit());
        result.put(AssessmentAttemptSnapshotContract.SETTINGS_SHOW_POINTS_PER_QUESTION, assignment.isShowPointsPerQuestion());
        return result;
    }

    private Map<String, Object> questionSnapshot(Question question) {
        Map<String, Object> definition = parseDefinition(question.getDefinition());
        List<QuestionOption> options = questionOptionRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId());
        List<QuestionAnswer> answers = questionAnswerRepository.findByQuestionId(question.getId());

        Map<String, Object> spec = new LinkedHashMap<>();
        spec.put("type", question.getType().name());
        spec.put("prompt", question.getContent());
        spec.put("content", question.getContent());
        spec.put("matchingMode", question.getMatchingMode());
        if (question.getType() == QuestionType.SINGLE_CHOICE || question.getType() == QuestionType.MULTIPLE_CHOICE) {
            spec.put("choices", options.stream().sorted(Comparator.comparingInt(QuestionOption::getDisplayOrder)).map(o -> {
                Map<String, Object> choice = new LinkedHashMap<>();
                choice.put("key", o.getOptionKey());
                choice.put("text", o.getContent());
                return choice;
            }).toList());
        }
        if (question.getType() == QuestionType.CLOZE) {
            Map<String, Object> cloze = nested(definition, "cloze");
            spec.put("segments", safeSegments(cloze.get("segments")));
            spec.put("blanks", safeBlanks(cloze.get("blanks")));
            spec.put("caseSensitive", Boolean.TRUE.equals(cloze.get("caseSensitive")));
        }
        if (question.getType() == QuestionType.MATCHING) {
            Map<String, Object> matching = nested(definition, "matching");
            if (matching.containsKey("poolId")) spec.put("poolId", matching.get("poolId"));
            spec.put("items", safeMatchingItems(matching.get("items")));
        }

        Map<String, Object> grading = new LinkedHashMap<>();
        grading.put("type", question.getType().name());
        grading.put("contentRevision", question.getContentRevision());
        grading.put("matchingMode", question.getMatchingMode());
        grading.put("definition", definition);
        grading.put("options", options.stream().map(o -> Map.of(
                "key", o.getOptionKey(), "text", o.getContent(), "correct", o.isCorrect())).toList());
        grading.put("answers", answers.stream().map(a -> Map.of(
                "rawValue", a.getRawValue(), "normalizedValue", a.getNormalizedValue())).toList());
        grading.put("explanation", question.getExplanation());

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("version", AssessmentAttemptSnapshotContract.CURRENT_VERSION);
        snapshot.put("student", Map.of("spec", spec));
        snapshot.put("grading", grading);
        return snapshot;
    }

    private Map<String, Object> parseDefinition(String json) {
        if (json == null || json.isBlank()) return new LinkedHashMap<>();
        try { return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {}); }
        catch (Exception ex) { throw new AppException(ErrorCode.QUESTION_DEFINITION_INVALID); }
    }

    private Map<String, Object> nested(Map<String, Object> definition, String key) {
        Object value = definition.get(key);
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> result = new LinkedHashMap<>();
            map.forEach((k, v) -> { if (k instanceof String s) result.put(s, v); });
            return result;
        }
        return definition;
    }

    private List<Map<String, Object>> safeSegments(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object part : list) if (part instanceof Map<?, ?> map) {
            Map<String, Object> row = new LinkedHashMap<>();
            if (map.get("text") instanceof String text) row.put("text", text);
            result.add(row);
        }
        return result;
    }

    private List<Map<String, Object>> safeBlanks(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object part : list) if (part instanceof Map<?, ?> map && map.get("key") instanceof String key) {
            result.add(Map.of("key", key));
        }
        return result;
    }

    private List<Map<String, Object>> safeMatchingItems(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object part : list) if (part instanceof Map<?, ?> map) {
            Map<String, Object> row = new LinkedHashMap<>();
            Object key = map.get("key");
            Object text = map.get("content") != null ? map.get("content") : map.get("prompt");
            if (key instanceof String k) row.put("key", k);
            if (text instanceof String t) row.put("content", t);
            if (!row.isEmpty()) result.add(row);
        }
        return result;
    }

    private Comparator<AssignmentItem> itemOrder() {
        return Comparator.comparing(AssignmentItem::getPosition).thenComparing(AssignmentItem::getId);
    }
}
