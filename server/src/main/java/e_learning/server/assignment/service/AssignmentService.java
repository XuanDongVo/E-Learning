package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.entity.AssignmentQuestion;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assignment.repository.AssignmentQuestionRepository;
import e_learning.server.assignment.repository.AssignmentSectionRepository;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.entity.AssignmentSection;
import e_learning.server.assignment.entity.AssignmentItem;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;
    private final AssignmentSectionRepository assignmentSectionRepository;
    private final AssignmentItemRepository assignmentItemRepository;
    private final ClassRepository classRepository;
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public List<AssignmentResponse> list() {
        return assignmentRepository.findAllByStatusNotOrderByDueAtAscIdAsc(AssignmentStatus.ARCHIVED)
                .stream().map(assignment -> AssignmentResponse.from(assignment, (int) assignmentQuestionRepository.countByAssignmentId(assignment.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public AssignmentResponse get(Long id) {
        Assignment assignment = find(id);
        return AssignmentResponse.from(assignment, (int) assignmentQuestionRepository.countByAssignmentId(assignment.getId()));
    }

    public AssignmentResponse create(CreateAssignmentRequest request, Long teacherId) {
        String name = request.name().trim();
        String academicYear = request.academicYear().trim();
        Grade grade = resolveGrade(request.gradeId());
        List<Long> classIds = validateClassIds(request.classIds(), grade, academicYear, teacherId);
        if (assignmentRepository.existsByGrade_IdAndAcademicYearAndNameIgnoreCase(
                grade.getId(), academicYear, name)) {
            throw new AppException(ErrorCode.ASSIGNMENT_INVALID_CONFIGURATION);
        }
        validateSchedule(request.startAt(), request.dueAt(), request.timeLimitMinutes());

        Assignment assignment = new Assignment();
        assignment.setGrade(grade);
        assignment.setAcademicYear(academicYear);
        assignment.setClassIds(classIds);
        assignment.setName(name);
        assignment.setDescription(trimToNull(request.description()));
        assignment.setStartAt(request.startAt());
        assignment.setDueAt(request.dueAt());
        assignment.setTimeLimitMinutes(request.timeLimitMinutes());
        assignment.setShowAnswersAfterSubmit(request.showAnswersAfterSubmit() == null || request.showAnswersAfterSubmit());
        return AssignmentResponse.from(assignmentRepository.save(assignment), 0);
    }

    public AssignmentResponse update(Long id, CreateAssignmentRequest request, Long teacherId) {
        Assignment assignment = find(id);

        String name = request.name().trim();
        String academicYear = request.academicYear().trim();
        Grade grade = resolveGrade(request.gradeId());
        List<Long> classIds = validateClassIds(request.classIds(), grade, academicYear, teacherId);

        boolean changedIdentity =
                        !assignment.getName().equalsIgnoreCase(name)
                        || !assignment.getAcademicYear().equalsIgnoreCase(academicYear)
                        || !assignment.getGrade().getId().equals(grade.getId());

        if (changedIdentity
                        && assignmentRepository.existsByGrade_IdAndAcademicYearAndNameIgnoreCase(
                        grade.getId(),
                        academicYear,
                        name
        )) {
            throw new AppException(ErrorCode.ASSIGNMENT_INVALID_CONFIGURATION);
        }

        validateSchedule(request.startAt(), request.dueAt(), request.timeLimitMinutes());

        assignment.setGrade(grade);
        assignment.setAcademicYear(academicYear);
        assignment.setClassIds(classIds);
        assignment.setName(name);
        assignment.setDescription(trimToNull(request.description()));
        assignment.setStartAt(request.startAt());
        assignment.setDueAt(request.dueAt());
        assignment.setTimeLimitMinutes(request.timeLimitMinutes());
        assignment.setShowAnswersAfterSubmit(request.showAnswersAfterSubmit() == null || request.showAnswersAfterSubmit());

        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.from(saved, (int) assignmentQuestionRepository.countByAssignmentId(saved.getId()));
    }

    public AssignmentResponse updateStatus(Long id, AssignmentStatus status) {
        Assignment assignment = find(id);
        AssignmentStatus current = assignment.getStatus();
        AssignmentStatus next = status;

        // State machine: chỉ cho phép các transition hợp lệ
        boolean allowed = (current == AssignmentStatus.DRAFT && (next == AssignmentStatus.PUBLISHED || next == AssignmentStatus.ARCHIVED))
                || (current == AssignmentStatus.PUBLISHED && next == AssignmentStatus.ARCHIVED)
                || (current == AssignmentStatus.ARCHIVED && next == AssignmentStatus.DRAFT);
        if (!allowed) {
            throw new AppException(ErrorCode.ASSIGNMENT_STATUS_TRANSITION_INVALID);
        }

        if (next == AssignmentStatus.PUBLISHED) {
            validateReadyForPublish(assignment);
        }

        assignment.setStatus(next);
        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.from(saved, (int) assignmentQuestionRepository.countByAssignmentId(saved.getId()));
    }

    /**
     * Publishing is a server-side invariant. Drafts may be incomplete, but every
     * piece of metadata, Composition structure and scoring must be valid here.
     */
    private void validateReadyForPublish(Assignment assignment) {
        if (assignment.getName() == null || assignment.getName().isBlank()) {
            throw notReady("Assignment title is required before publishing.");
        }
        if (assignment.getGrade() == null || assignment.getAcademicYear() == null
                || assignment.getAcademicYear().isBlank()) {
            throw notReady("Assignment grade and academic year are required before publishing.");
        }
        if (assignment.getClassIds() == null || assignment.getClassIds().isEmpty()
                || assignment.getClassIds().stream().anyMatch(id -> id == null)
                || new HashSet<>(assignment.getClassIds()).size() != assignment.getClassIds().size()) {
            throw notReady("Assignment must target at least one valid class.");
        }
        List<ClassEntity> targetClasses = classRepository.findAllById(assignment.getClassIds());
        if (targetClasses.size() != assignment.getClassIds().size()) {
            throw notReady("One or more target classes no longer exist.");
        }
        for (ClassEntity targetClass : targetClasses) {
            if (targetClass.getGrade() == null
                    || !targetClass.getGrade().getId().equals(assignment.getGrade().getId())
                    || targetClass.getAcademicYear() == null
                    || !targetClass.getAcademicYear().trim().equals(assignment.getAcademicYear().trim())) {
                throw notReady("Target class " + targetClass.getId()
                        + " does not match the Assignment grade and academic year.");
            }
        }
        if (assignment.getStartAt() == null || assignment.getDueAt() == null
                || !assignment.getStartAt().isBefore(assignment.getDueAt())) {
            throw notReady("Assignment start date must be before its due date.");
        }
        if (!assignment.getDueAt().isAfter(LocalDateTime.now())) {
            throw notReady("Assignment due date must be in the future.");
        }
        if (assignment.getTimeLimitMinutes() == null || assignment.getTimeLimitMinutes() <= 1) {
            throw notReady("Assignment time limit must be a whole number greater than 1 minute.");
        }

        List<AssignmentQuestion> ownerships =
                assignmentQuestionRepository.findAllByAssignmentIdOrderByQuestionIdAsc(assignment.getId());
        if (ownerships.isEmpty()) {
            throw notReady("Assignment must contain at least one question.");
        }
        Set<Long> ownedQuestionIds = new HashSet<>();
        for (AssignmentQuestion ownership : ownerships) {
            Long questionId = ownership.getQuestionId();
            ownedQuestionIds.add(questionId);
            if (ownership.getQuestion() == null || !ownership.getQuestion().isComplete()) {
                throw notReady("Question " + questionId + " is incomplete and prevents publishing.");
            }
        }

        List<AssignmentSection> sections =
                assignmentSectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignment.getId());
        if (sections.isEmpty()) {
            throw notReady("Assignment Composition must contain at least one section.");
        }
        for (int index = 0; index < sections.size(); index++) {
            AssignmentSection section = sections.get(index);
            if (section.getPosition() == null || section.getPosition() != index + 1) {
                throw notReady("Composition section " + section.getId()
                        + " has an invalid position; section positions must be contiguous starting at 1.");
            }
            if (section.getTitle() == null || section.getTitle().isBlank()) {
                throw notReady("Composition section " + section.getId() + " requires a title.");
            }
        }

        List<AssignmentItem> items =
                assignmentItemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignment.getId());
        if (items.isEmpty()) {
            throw notReady("Assignment Composition must contain at least one item.");
        }
        Map<Long, AssignmentItem> itemsById = new java.util.HashMap<>();
        Map<Long, List<AssignmentItem>> rootsBySection = new java.util.HashMap<>();
        Map<Long, List<AssignmentItem>> childrenByParent = new java.util.HashMap<>();
        Set<Long> compositionQuestionIds = new HashSet<>();
        java.math.BigDecimal totalScoredPoints = java.math.BigDecimal.ZERO;
        Set<Long> sectionIds = sections.stream().map(AssignmentSection::getId)
                .collect(java.util.stream.Collectors.toSet());

        for (AssignmentItem item : items) {
            itemsById.put(item.getId(), item);
            if (item.getAssignment() == null || !assignment.getId().equals(item.getAssignment().getId())
                    || item.getSection() == null || !sectionIds.contains(item.getSection().getId())) {
                throw notReady("Composition item " + item.getId()
                        + " references an invalid Assignment or section.");
            }
            if (item.getParentItem() == null) {
                rootsBySection.computeIfAbsent(item.getSection().getId(), ignored -> new java.util.ArrayList<>()).add(item);
            } else {
                childrenByParent.computeIfAbsent(item.getParentItem().getId(), ignored -> new java.util.ArrayList<>()).add(item);
            }
        }

        for (AssignmentSection section : sections) {
            List<AssignmentItem> roots = rootsBySection.getOrDefault(section.getId(), List.of());
            if (roots.isEmpty()) {
                throw notReady("Composition section " + section.getId() + " is empty.");
            }
            validateContiguousItemPositions(roots, "section " + section.getId());
        }

        for (AssignmentItem item : items) {
            String type = item.getItemType() == null ? "" : item.getItemType().trim().toUpperCase(java.util.Locale.ROOT);
            java.math.BigDecimal points = item.getPossiblePoints();
            if (points == null || points.signum() < 0) {
                throw notReady("Composition item " + item.getId() + " has invalid possible points.");
            }
            List<AssignmentItem> children = childrenByParent.getOrDefault(item.getId(), List.of());
            if (!children.isEmpty()) {
                if ("QUESTION".equals(type)) {
                    throw notReady("Question item " + item.getId() + " cannot contain child items.");
                }
                for (AssignmentItem child : children) {
                    if (!"QUESTION".equalsIgnoreCase(child.getItemType())
                            || !child.getSection().getId().equals(item.getSection().getId())) {
                        throw notReady("Composition item " + item.getId()
                                + " contains an invalid nested item " + child.getId() + ".");
                    }
                }
                validateContiguousItemPositions(children, "item " + item.getId());
            }

            if ("QUESTION".equals(type)) {
                Long questionId = item.getQuestionId();
                if (questionId == null || !ownedQuestionIds.contains(questionId)) {
                    throw notReady("Composition item " + item.getId()
                            + " references a question not owned by this Assignment.");
                }
                if (!compositionQuestionIds.add(questionId)) {
                    throw notReady("Question " + questionId + " appears more than once in Composition.");
                }
                AssignmentQuestion ownership = ownerships.stream()
                        .filter(row -> row.getQuestionId().equals(questionId)).findFirst().orElse(null);
                if (ownership == null || ownership.getQuestion() == null || !ownership.getQuestion().isComplete()) {
                    throw notReady("Question " + questionId + " is missing or incomplete.");
                }
                if (item.getBlockPayload() != null && !item.getBlockPayload().isEmpty()) {
                    throw notReady("Question item " + item.getId() + " must not contain a block payload.");
                }
                if (item.isExample()) {
                    if (points.signum() != 0) {
                        throw notReady("Example item " + item.getId() + " must have zero points.");
                    }
                } else {
                    if (points.signum() <= 0) {
                        throw notReady("Scored item " + item.getId() + " must have positive points.");
                    }
                    totalScoredPoints = totalScoredPoints.add(points);
                }
            } else if (Set.of("INSTRUCTIONS", "PASSAGE", "MEDIA", "POOL").contains(type)) {
                if (item.getQuestionId() != null || item.isExample() || points.signum() != 0
                        || item.getBlockPayload() == null || item.getBlockPayload().isEmpty()) {
                    throw notReady("Content block item " + item.getId()
                            + " has invalid question, example, points or payload fields.");
                }
                validateReadyBlockPayload(item);
            } else {
                throw notReady("Composition item " + item.getId() + " has unsupported type '" + type + "'.");
            }
            if (item.getParentItem() != null) {
                AssignmentItem parent = itemsById.get(item.getParentItem().getId());
                if (parent == null || !sectionIds.contains(parent.getSection().getId())
                        || !parent.getSection().getId().equals(item.getSection().getId())
                        || "QUESTION".equalsIgnoreCase(parent.getItemType())) {
                    throw notReady("Composition item " + item.getId() + " has an invalid parent reference.");
                }
            }
        }

        if (!compositionQuestionIds.equals(ownedQuestionIds)) {
            Set<Long> missing = new HashSet<>(ownedQuestionIds);
            missing.removeAll(compositionQuestionIds);
            if (!missing.isEmpty()) {
                throw notReady("Questions are linked to the Assignment but missing from Composition: " + missing + ".");
            }
            throw notReady("Composition contains questions that are not linked to the Assignment.");
        }
        if (totalScoredPoints.signum() <= 0) {
            throw notReady("Assignment must have more than zero possible scored points after examples are excluded.");
        }
    }

    private void validateContiguousItemPositions(List<AssignmentItem> items, String container) {
        List<AssignmentItem> ordered = items.stream()
                .sorted(java.util.Comparator.comparing(AssignmentItem::getPosition,
                        java.util.Comparator.nullsFirst(Integer::compareTo)))
                .toList();
        for (int index = 0; index < ordered.size(); index++) {
            Integer position = ordered.get(index).getPosition();
            if (position == null || position != index + 1) {
                throw notReady("Composition item " + ordered.get(index).getId()
                        + " has an invalid position in " + container + ".");
            }
        }
    }

    private void validateReadyBlockPayload(AssignmentItem item) {
        Map<String, Object> payload = item.getBlockPayload();
        String type = item.getItemType().trim().toUpperCase(java.util.Locale.ROOT);
        switch (type) {
            case "INSTRUCTIONS", "PASSAGE" -> {
                if (!(payload.get("text") instanceof String text) || text.isBlank()) {
                    throw notReady("Content block item " + item.getId() + " requires non-empty text.");
                }
            }
            case "MEDIA" -> {
                if (!(payload.get("assetId") instanceof String assetId) || assetId.isBlank()
                        || !(payload.get("altText") instanceof String altText) || altText.isBlank()) {
                    throw notReady("Media item " + item.getId() + " requires an asset and meaningful alt text.");
                }
            }
            case "POOL" -> {
                Object entries = payload.get("entries");
                if (!(entries instanceof List<?> list) || list.isEmpty()) {
                    throw notReady("Pool item " + item.getId() + " requires at least one entry.");
                }
                for (Object entry : list) {
                    if (!(entry instanceof Map<?, ?> map)
                            || !(map.get("text") instanceof String text) || text.isBlank()) {
                        throw notReady("Pool item " + item.getId() + " has an entry without text.");
                    }
                }
            }
            default -> throw notReady("Unsupported content block item " + item.getId() + ".");
        }
    }

    private AppException notReady(String detail) {
        return new AppException(ErrorCode.ASSIGNMENT_NOT_READY, detail);
    }


    private Grade resolveGrade(Long gradeId) {
        if (gradeId == null) {
            throw new AppException(ErrorCode.GRADE_NOT_FOUND);
        }
        return gradeRepository.findById(gradeId)
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));
    }

    private List<Long> validateClassIds(
            List<Long> classIds,
            Grade grade,
            String academicYear,
            Long teacherId
    ) {
        if (classIds == null || classIds.isEmpty()) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_REQUIRED);
        }
        if (classIds.stream().anyMatch(id -> id == null)) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }
        Set<Long> uniqueIds = new HashSet<>(classIds);
        if (uniqueIds.size() != classIds.size()) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }

        List<ClassEntity> classes = classRepository.findAllById(uniqueIds);
        if (classes.size() != uniqueIds.size()) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }
        for (ClassEntity classEntity : classes) {
            if (!classEntity.getTeacher().getId().equals(teacherId)
                    || !classEntity.getGrade().getId().equals(grade.getId())
                    || !classEntity.getAcademicYear().trim().equals(academicYear)) {
                throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
            }
        }
        return List.copyOf(classIds);
    }

    private Assignment find(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }

    private void validateSchedule(LocalDateTime startAt, LocalDateTime dueAt, Integer timeLimitMinutes) {
        if (dueAt == null || (startAt != null && !startAt.isBefore(dueAt))) {
            throw new AppException(ErrorCode.ASSIGNMENT_SCHEDULE_INVALID);
        }
        if (timeLimitMinutes == null || timeLimitMinutes <= 1) {
            throw new AppException(ErrorCode.ASSIGNMENT_TIME_LIMIT_INVALID);
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }
}
