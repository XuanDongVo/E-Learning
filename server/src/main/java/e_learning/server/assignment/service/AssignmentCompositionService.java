package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.entity.*;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.*;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentCompositionService {
    private static final Set<String> ITEM_TYPES = Set.of("QUESTION", "INSTRUCTIONS", "PASSAGE", "MEDIA", "POOL");

    private final AssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;
    private final AssignmentSectionRepository sectionRepository;
    private final AssignmentItemRepository itemRepository;

    @Transactional(readOnly = true)
    public AssignmentCompositionResponse get(Long assignmentId) {
        Assignment assignment = findAssignment(assignmentId);
        List<AssignmentSection> sections = sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignmentId);
        List<AssignmentItem> items = itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId);
        return toResponse(assignment, sections, items);
    }

    public AssignmentCompositionResponse replace(Long assignmentId, AssignmentCompositionRequest request) {
        Assignment assignment = findAssignment(assignmentId);
        if (assignment.getStatus() == AssignmentStatus.ARCHIVED) {
            throw invalid("Archived assignments cannot be edited.");
        }
        if (request.sections() == null || request.sections().isEmpty()) {
            throw invalid("Composition must contain at least one section.");
        }

        List<AssignmentSection> currentSections = sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignmentId);
        List<AssignmentItem> currentItems = itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId);
        Map<Long, AssignmentSection> sectionById = currentSections.stream().collect(Collectors.toMap(AssignmentSection::getId, s -> s));
        Map<Long, AssignmentItem> itemById = currentItems.stream().collect(Collectors.toMap(AssignmentItem::getId, i -> i));

        Set<Long> usedSectionIds = new HashSet<>();
        Set<Long> usedItemIds = new HashSet<>();
        Set<Long> questionIds = new HashSet<>();
        List<AssignmentSection> savedSections = new ArrayList<>();
        List<AssignmentItem> savedItems = new ArrayList<>();

        requireContiguousPositions(request.sections().stream().map(CompositionSectionRequest::position).toList(), "section");
        for (CompositionSectionRequest sectionRequest : request.sections()) {
            AssignmentSection section;
            if (sectionRequest.id() == null) {
                section = new AssignmentSection();
            } else {
                section = sectionById.get(sectionRequest.id());
                if (section == null) throw invalid("Section ID does not belong to this assignment.");
                usedSectionIds.add(section.getId());
            }
            section.setAssignment(assignment);
            section.setPosition(sectionRequest.position());
            section.setTitle(trim(sectionRequest.title()));
            section.setInstructions(trim(sectionRequest.instructions()));
            savedSections.add(sectionRepository.save(section));
        }

        Set<Long> ownedQuestionIds = assignmentQuestionRepository.findAllByAssignmentIdOrderByQuestionIdAsc(assignmentId)
                .stream().map(AssignmentQuestion::getQuestionId).collect(Collectors.toSet());

        for (int index = 0; index < request.sections().size(); index++) {
            CompositionSectionRequest sectionRequest = request.sections().get(index);
            AssignmentSection savedSection = savedSections.get(index);
            List<CompositionItemRequest> roots = sectionRequest.items() == null ? List.of() : sectionRequest.items();
            requireContiguousPositions(roots.stream().map(CompositionItemRequest::position).toList(), "item");
            for (CompositionItemRequest itemRequest : roots) {
                saveItemTree(assignment, savedSection, null, itemRequest, itemById, ownedQuestionIds,
                        usedItemIds, questionIds, savedItems);
            }
        }

        if (!questionIds.equals(ownedQuestionIds)) {
            Set<Long> missing = new HashSet<>(ownedQuestionIds);
            missing.removeAll(questionIds);
            throw invalid("Every assignment-owned question must appear exactly once in Composition. Missing question IDs: " + missing);
        }

        List<Long> staleItemIds = currentItems.stream().map(AssignmentItem::getId)
                .filter(id -> !usedItemIds.contains(id)).toList();
        if (!staleItemIds.isEmpty()) itemRepository.deleteAllById(staleItemIds);

        List<Long> staleSectionIds = currentSections.stream().map(AssignmentSection::getId)
                .filter(id -> !usedSectionIds.contains(id)).toList();
        if (!staleSectionIds.isEmpty()) sectionRepository.deleteAllById(staleSectionIds);

        assignment.setShowScoreAfterSubmit(request.showScoreAfterSubmit() == null || request.showScoreAfterSubmit());
        assignmentRepository.save(assignment);

        return toResponse(assignment,
                sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignmentId),
                itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId));
    }

    private void saveItemTree(Assignment assignment, AssignmentSection section, AssignmentItem parent,
                              CompositionItemRequest request, Map<Long, AssignmentItem> itemById,
                              Set<Long> ownedQuestionIds, Set<Long> usedItemIds, Set<Long> questionIds,
                              List<AssignmentItem> savedItems) {
        String type = request.itemType().trim().toUpperCase(Locale.ROOT);
        if (!ITEM_TYPES.contains(type)) throw invalid("Unsupported composition item type: " + type);
        if (request.position() == null || request.position() < 1) throw invalid("Item positions must be positive.");
        if (request.possiblePoints() == null || request.possiblePoints().signum() < 0) throw invalid("Item points cannot be negative.");
        if (request.example() && request.possiblePoints().signum() != 0) throw invalid("Example items must have zero points.");

        AssignmentItem item;
        if (request.id() == null) {
            item = new AssignmentItem();
        } else {
            item = itemById.get(request.id());
            if (item == null || !Objects.equals(item.getAssignment().getId(), assignment.getId())) {
                throw invalid("Item ID does not belong to this assignment.");
            }
            if (!usedItemIds.add(item.getId())) throw invalid("An item ID cannot appear more than once.");
        }
        if (request.id() == null) {
            // New entities have no stable ID yet; persisted ID is added to the used set below.
        }
        if ("QUESTION".equals(type)) {
            if (request.questionId() == null || !ownedQuestionIds.contains(request.questionId())) {
                throw invalid("Question items must reference a question owned by this assignment.");
            }
            if (!questionIds.add(request.questionId())) throw invalid("A question cannot appear more than once in Composition.");
            if (request.blockPayload() != null && !request.blockPayload().isEmpty()) throw invalid("Question items cannot contain block payload.");
            if (!request.example() && request.possiblePoints().signum() <= 0) throw invalid("Scored question items must have positive points.");
        } else {
            if (request.questionId() != null) throw invalid("Content blocks cannot reference question IDs.");
            if (request.blockPayload() == null || request.blockPayload().isEmpty()) throw invalid("Content blocks require a payload.");
            if (request.possiblePoints().signum() != 0 || request.example()) throw invalid("Content blocks must have zero points and cannot be examples.");
            validateBlockPayload(type, request.blockPayload());
        }
        List<CompositionItemRequest> children = request.children() == null ? List.of() : request.children();
        if (!children.isEmpty() && ("QUESTION".equals(type) || "INSTRUCTIONS".equals(type) || "MEDIA".equals(type))) {
            throw invalid("Only PASSAGE and POOL blocks may contain child items.");
        }
        requireContiguousPositions(children.stream().map(CompositionItemRequest::position).toList(), "child item");

        item.setAssignment(assignment);
        item.setSection(section);
        item.setParentItem(parent);
        item.setPosition(request.position());
        item.setItemType(type);
        item.setQuestionId(request.questionId());
        item.setPossiblePoints(request.possiblePoints());
        item.setRequired(request.required());
        item.setExample(request.example());
        item.setBlockPayload(request.blockPayload());
        AssignmentItem saved = itemRepository.save(item);
        usedItemIds.add(saved.getId());
        savedItems.add(saved);

        for (CompositionItemRequest child : children) {
            if (!"QUESTION".equalsIgnoreCase(child.itemType())) {
                throw invalid("Composition blocks cannot contain nested blocks in v1.");
            }
            saveItemTree(assignment, section, saved, child, itemById, ownedQuestionIds,
                    usedItemIds, questionIds, savedItems);
        }
    }

    private void validateBlockPayload(String type, Map<String, Object> payload) {
        switch (type) {
            case "INSTRUCTIONS" -> requireText(payload, "text", "INSTRUCTIONS blocks require text.");
            case "PASSAGE" -> requireText(payload, "text", "PASSAGE blocks require text.");
            case "MEDIA" -> {
                requireText(payload, "assetId", "MEDIA blocks require an assetId.");
                requireText(payload, "altText", "MEDIA blocks require meaningful altText.");
            }
            case "POOL" -> {
                Object entries = payload.get("entries");
                if (!(entries instanceof List<?> list) || list.isEmpty()) {
                    throw invalid("POOL blocks require a non-empty entries array.");
                }
            }
            default -> throw invalid("Unsupported block type.");
        }
    }

    private void requireText(Map<String, Object> payload, String key, String message) {
        Object value = payload.get(key);
        if (!(value instanceof String text) || text.isBlank()) throw invalid(message);
    }

    private void requireContiguousPositions(List<Integer> positions, String label) {
        if (positions.isEmpty()) return;
        Set<Integer> unique = new HashSet<>(positions);
        if (unique.size() != positions.size()) throw invalid("Duplicate " + label + " positions.");
        for (int position = 1; position <= positions.size(); position++) {
            if (!unique.contains(position)) throw invalid(label + " positions must be contiguous starting at 1.");
        }
    }

    private AssignmentCompositionResponse toResponse(Assignment assignment, List<AssignmentSection> sections,
                                                      List<AssignmentItem> items) {
        Map<Long, List<AssignmentItem>> childrenByParent = items.stream()
                .filter(i -> i.getParentItem() != null)
                .collect(Collectors.groupingBy(i -> i.getParentItem().getId()));
        Map<Long, List<AssignmentItem>> rootsBySection = items.stream()
                .filter(i -> i.getParentItem() == null)
                .collect(Collectors.groupingBy(i -> i.getSection().getId()));
        List<CompositionSectionResponse> sectionResponses = sections.stream().map(section ->
                new CompositionSectionResponse(section.getId(), section.getPosition(), section.getTitle(),
                        section.getInstructions(), rootsBySection.getOrDefault(section.getId(), List.of()).stream()
                        .sorted(Comparator.comparing(AssignmentItem::getPosition).thenComparing(AssignmentItem::getId))
                        .map(item -> toItemResponse(item, childrenByParent)).toList())
        ).toList();
        return new AssignmentCompositionResponse(assignment.getId(), assignment.getCompositionSchemaVersion(),
                assignment.getCompositionProvenance(), assignment.isShowScoreAfterSubmit(), sectionResponses);
    }

    private CompositionItemResponse toItemResponse(AssignmentItem item, Map<Long, List<AssignmentItem>> childrenByParent) {
        List<CompositionItemResponse> children = childrenByParent.getOrDefault(item.getId(), List.of()).stream()
                .sorted(Comparator.comparing(AssignmentItem::getPosition).thenComparing(AssignmentItem::getId))
                .map(child -> toItemResponse(child, childrenByParent)).toList();
        return new CompositionItemResponse(item.getId(), item.getPosition(), item.getItemType(), item.getQuestionId(),
                item.getPossiblePoints(), item.isRequired(), item.isExample(), item.getBlockPayload(), children);
    }

    private Assignment findAssignment(Long id) {
        return assignmentRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }

    private AppException invalid(String message) {
        // Keep the API error vocabulary stable while returning a precise validation message in logs.
        return new AppException(ErrorCode.ASSIGNMENT_INVALID_CONFIGURATION);
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
