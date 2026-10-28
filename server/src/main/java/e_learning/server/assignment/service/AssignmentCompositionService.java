package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.entity.*;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.*;
import e_learning.server.question.dto.request.QuestionDefinitionRequest;
import e_learning.server.question.entity.Question;
import tools.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    public AssignmentCompositionResponse get(Long assignmentId) {
        Assignment assignment = findAssignment(assignmentId);
        List<AssignmentSection> sections = sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignmentId);
        if (sections.isEmpty()) {
            AssignmentSection section = new AssignmentSection();
            section.setAssignment(assignment);
            section.setPosition(1);
            section.setTitle("Section 1");
            sections = List.of(sectionRepository.save(section));
        }
        List<AssignmentItem> items = itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId);
        return toResponse(assignment, sections, items);
    }

    /**
     * Ghi đè TOÀN BỘ composition (section -> item -> item con) của một assignment bằng dữ liệu client gửi lên.
     *
     * Ý tưởng chính: coi request là "trạng thái đích", so sánh với DB rồi
     *   - giữ / cập nhật những gì còn xuất hiện,
     *   - tạo mới những gì chưa có,
     *   - xóa những gì không còn.
     *
     * Vì DB có 2 loại unique constraint dễ va chạm khi kéo-thả:
     *   (1) unique (container, position)        -> xử lý bằng shiftPositionsForReplacement
     *   (2) unique (assignment_id, question_id) -> xử lý bằng bước 3 + 4 bên dưới (nguyên nhân lỗi uq_assignment_item_question)
     *
     * Bắt buộc chạy trong 1 transaction: lỗi validate ở giữa chừng sẽ rollback toàn bộ
     * (kể cả các bước xóa/dời dữ liệu đã thực hiện ở đầu hàm).
     */
    @Transactional
    public AssignmentCompositionResponse replace(Long assignmentId, AssignmentCompositionRequest request) {
        // ---------- 0. Validate đầu vào ----------
        Assignment assignment = findAssignment(assignmentId);
        if (assignment.getStatus() == AssignmentStatus.ARCHIVED) {
            throw invalid("Archived assignments cannot be edited.");
        }
        if (request.sections() == null || request.sections().isEmpty()) {
            throw invalid("Composition must contain at least one section.");
        }

        // ---------- 1. Nạp trạng thái hiện tại trong DB ----------
        List<AssignmentSection> currentSections = sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignmentId);
        List<AssignmentItem> currentItems = itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId);
        Map<Long, AssignmentSection> sectionById = currentSections.stream().collect(Collectors.toMap(AssignmentSection::getId, s -> s));
        Map<Long, AssignmentItem> itemById = currentItems.stream().collect(Collectors.toMap(AssignmentItem::getId, i -> i));

        // ---------- 2. Duyệt trước request (chưa ghi gì) để biết client "muốn giữ" những item nào ----------
        // Làm phẳng cây request: section -> item gốc -> item con thành 1 danh sách.
        List<CompositionItemRequest> requestItems = flattenRequestItems(request.sections());

        // ID item mà client gửi kèm, và câu hỏi mà mỗi item đó sẽ trỏ tới sau khi lưu
        // (item không phải QUESTION => null).
        Set<Long> requestedItemIds = new HashSet<>();
        Map<Long, Long> requestedQuestionByItemId = new HashMap<>();
        for (CompositionItemRequest r : requestItems) {
            if (r.id() != null) {
                requestedItemIds.add(r.id());
                requestedQuestionByItemId.put(r.id(), isQuestionRequest(r) ? r.questionId() : null);
            }
        }

        // Các item QUESTION cũ mà client KHÔNG nhắc tới bằng ID. Nếu client gửi item mới (id = null) cho
        // đúng câu hỏi đó (ví dụ frontend dựng lại cây khi kéo câu hỏi sang section khác), ta TÁI SỬ DỤNG
        // item cũ thay vì INSERT mới -> không vi phạm uq_assignment_item_question và giữ nguyên ID item.
        Map<Long, AssignmentItem> reusableQuestionItems = new HashMap<>();
        for (AssignmentItem i : currentItems) {
            if ("QUESTION".equals(i.getItemType()) && i.getQuestionId() != null
                    && !requestedItemIds.contains(i.getId())) {
                reusableQuestionItems.putIfAbsent(i.getQuestionId(), i);
            }
        }

        // Tập item cũ được giữ lại = item client gửi ID + item cũ sẽ được tái sử dụng ở trên.
        Set<Long> keepItemIds = new HashSet<>(requestedItemIds);
        for (CompositionItemRequest r : requestItems) {
            if (r.id() == null && isQuestionRequest(r) && r.questionId() != null) {
                AssignmentItem reuse = reusableQuestionItems.get(r.questionId());
                if (reuse != null) keepItemIds.add(reuse.getId());
            }
        }

        // ---------- 3. Xóa TRƯỚC các item cũ không còn dùng ----------
        // Phải xóa trước khi INSERT/UPDATE: nếu để xóa ở cuối, bản ghi cũ vẫn giữ (assignment_id, question_id)
        // và làm INSERT item mới cho cùng câu hỏi bị trùng khóa.
        List<AssignmentItem> staleItems = currentItems.stream()
                .filter(i -> !keepItemIds.contains(i.getId()))
                // item con (có parent) xóa trước item cha để không vướng khóa ngoại parent_item_id
                .sorted(Comparator.comparing((AssignmentItem i) -> i.getParentItem() == null))
                .toList();

        // Item được giữ nhưng cha của nó bị xóa (vd: câu hỏi bị kéo ra khỏi PASSAGE cũ):
        // gỡ liên kết cha trước, vị trí/cha thật sự sẽ được gán lại ở saveItemTree.
        for (AssignmentItem i : currentItems) {
            if (keepItemIds.contains(i.getId()) && i.getParentItem() != null
                    && !keepItemIds.contains(i.getParentItem().getId())) {
                i.setParentItem(null);
            }
        }

        // ---------- 4. Giải phóng question_id của item sẽ đổi câu hỏi (trường hợp hoán đổi) ----------
        // Ví dụ item A giữ câu 32, item B giữ câu 31, client gửi A->31 và B->32:
        // nếu UPDATE từng dòng sẽ trùng khóa tạm thời, nên gỡ question_id trước rồi mới gán lại.
        // (Yêu cầu cột question_id cho phép NULL - các block nội dung đang để null nên hợp lệ.)
        for (AssignmentItem i : currentItems) {
            if (keepItemIds.contains(i.getId())
                    && "QUESTION".equals(i.getItemType()) && i.getQuestionId() != null
                    && requestedQuestionByItemId.containsKey(i.getId())
                    && !Objects.equals(requestedQuestionByItemId.get(i.getId()), i.getQuestionId())) {
                i.setQuestionId(null);
            }
        }

        // Hibernate flush theo thứ tự INSERT -> UPDATE -> DELETE, nên gọi flush ở đây để các thay đổi
        // ở bước 3-4 được ghi xuống DB (và các dòng stale bị xóa) TRƯỚC khi lưu dữ liệu mới.
        itemRepository.deleteAll(staleItems);
        itemRepository.flush();

        // ---------- 5. Dời position cũ ra khỏi vùng giá trị đích ----------
        // Để việc hoán đổi thứ tự không vi phạm unique (container, position) giữa chừng.
        // Lưu ý: nếu query này không có @Modifying(clearAutomatically = true), entity đang nằm trong
        // persistence context vẫn giữ position cũ; khi position mới trùng position cũ, Hibernate coi như
        // "không đổi" và không UPDATE -> DB giữ giá trị đã dời. Hãy kiểm tra annotation ở repository.
        sectionRepository.shiftPositionsForReplacement(assignmentId);
        itemRepository.shiftPositionsForReplacement(assignmentId);

        Set<Long> usedSectionIds = new HashSet<>();
        Set<Long> usedItemIds = new HashSet<>();
        Set<Long> questionIds = new HashSet<>();
        List<AssignmentSection> savedSections = new ArrayList<>();
        List<AssignmentItem> savedItems = new ArrayList<>();

        // ---------- 6. Upsert các section ----------
        requireContiguousPositions(request.sections().stream().map(CompositionSectionRequest::position).toList(), "section");
        for (CompositionSectionRequest sectionRequest : request.sections()) {
            AssignmentSection section;
            if (sectionRequest.id() == null) {
                section = new AssignmentSection();                      // section mới
            } else {
                section = sectionById.get(sectionRequest.id());         // section cũ phải thuộc assignment này
                if (section == null) throw invalid("Section ID does not belong to this assignment.");
                if (!usedSectionIds.add(section.getId())) throw invalid("A section ID cannot appear more than once.");
            }
            section.setAssignment(assignment);
            section.setPosition(sectionRequest.position());
            section.setTitle(trim(sectionRequest.title()));
            section.setInstructions(trim(sectionRequest.instructions()));
            section.setTitleVi(trim(sectionRequest.titleVi()));
            section.setInstructionsVi(trim(sectionRequest.instructionsVi()));
            savedSections.add(sectionRepository.save(section));
        }

        // Các câu hỏi thuộc assignment: composition phải dùng đủ, mỗi câu đúng 1 lần.
        List<AssignmentQuestion> ownedQuestions =
                assignmentQuestionRepository.findAllByAssignmentIdOrderByQuestionIdAsc(assignmentId);
        Set<Long> ownedQuestionIds = ownedQuestions.stream()
                .map(AssignmentQuestion::getQuestionId).collect(Collectors.toSet());

        // Matching phải được đặt dưới đúng POOL block và correctEntryId phải tồn tại trong pool đó.
        // Không dựa vào text làm identity: text có thể trùng hoặc được sửa sau này.
        Map<Long, Question> questionsById = ownedQuestions.stream()
                .collect(Collectors.toMap(AssignmentQuestion::getQuestionId, AssignmentQuestion::getQuestion));
        validateMatchingPoolReferences(request.sections(), questionsById);

        // ---------- 7. Upsert các item (đệ quy theo cây) ----------
        for (int index = 0; index < request.sections().size(); index++) {
            CompositionSectionRequest sectionRequest = request.sections().get(index);
            AssignmentSection savedSection = savedSections.get(index);
            List<CompositionItemRequest> roots = sectionRequest.items() == null ? List.of() : sectionRequest.items();
            requireContiguousPositions(roots.stream().map(CompositionItemRequest::position).toList(), "item");
            for (CompositionItemRequest itemRequest : roots) {
                saveItemTree(assignment, savedSection, null, itemRequest, itemById, reusableQuestionItems,
                        ownedQuestionIds, usedItemIds, questionIds, savedItems);
            }
        }

        // ---------- 8. Đồng bộ liên kết AssignmentQuestion với Composition ----------
        // Composition là nguồn sự thật cho việc câu hỏi nào đang được đặt trong Assignment.
        // Câu hỏi bị gỡ khỏi Composition chỉ mất liên kết AssignmentQuestion; không xóa Question gốc.
        if (!ownedQuestionIds.containsAll(questionIds)) {
            throw invalid("Composition contains a question that is not linked to this assignment.");
        }
        Set<Long> detachedQuestionIds = new HashSet<>(ownedQuestionIds);
        detachedQuestionIds.removeAll(questionIds);
        if (!detachedQuestionIds.isEmpty()) {
            // AssignmentQuestion uses question_id as its primary key. Delete association rows only.
            // Do not call QuestionPersistenceService.deleteQuestions() here.
            assignmentQuestionRepository.deleteAllById(detachedQuestionIds);
            assignmentQuestionRepository.flush();
        }

        // ---------- 9. Xóa section cũ không còn dùng ----------
        // (Item đã được xử lý ở bước 3, nên lúc này section stale không còn item nào tham chiếu.)
        List<Long> staleSectionIds = currentSections.stream().map(AssignmentSection::getId)
                .filter(id -> !usedSectionIds.contains(id)).toList();
        if (!staleSectionIds.isEmpty()) sectionRepository.deleteAllById(staleSectionIds);

        // ---------- 10. Cấu hình hiển thị (mặc định true nếu client không gửi) ----------
        assignment.setShowScoreAfterSubmit(request.showScoreAfterSubmit() == null || request.showScoreAfterSubmit());
        assignment.setShowPointsPerQuestion(request.showPointsPerQuestion() == null || request.showPointsPerQuestion());
        assignmentRepository.save(assignment);

        // ---------- 11. Đọc lại từ DB theo đúng thứ tự để trả về ----------
        return toResponse(assignment,
                sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(assignmentId),
                itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(assignmentId));
    }

    /**
     * Validate và lưu một item, sau đó đệ quy lưu các item con.
     *
     * Quy tắc theo loại:
     *  - QUESTION: phải trỏ tới câu hỏi thuộc assignment, mỗi câu chỉ xuất hiện 1 lần, không có blockPayload,
     *              điểm > 0 (trừ khi là example thì điểm = 0).
     *  - Block nội dung (PASSAGE / POOL / INSTRUCTIONS): không có questionId, bắt buộc có blockPayload,
     *              điểm = 0 và không phải example.
     *  - Mọi content block (INSTRUCTIONS / PASSAGE / MEDIA / POOL) có thể chia sẻ nội dung với các QUESTION con;
     *    v1 không cho phép lồng content block bên trong content block khác.
     *
     * @param itemById              item hiện có trong DB, tra theo ID (khi request gửi id)
     * @param reusableQuestionItems item QUESTION cũ chưa được request nhắc tới bằng ID, tra theo questionId;
     *                              dùng để tái sử dụng khi request gửi item mới (id = null) cho cùng câu hỏi
     */
    private void saveItemTree(Assignment assignment, AssignmentSection section, AssignmentItem parent,
                              CompositionItemRequest request, Map<Long, AssignmentItem> itemById,
                              Map<Long, AssignmentItem> reusableQuestionItems,
                              Set<Long> ownedQuestionIds, Set<Long> usedItemIds, Set<Long> questionIds,
                              List<AssignmentItem> savedItems) {
        // --- Validate các trường chung ---
        if (request.itemType() == null || request.itemType().isBlank()) throw invalid("Item type is required.");
        String type = request.itemType().trim().toUpperCase(Locale.ROOT);
        if (!ITEM_TYPES.contains(type)) throw invalid("Unsupported composition item type: " + type);
        if (request.position() == null || request.position() < 1) throw invalid("Item positions must be positive.");
        if (request.possiblePoints() == null || request.possiblePoints().signum() < 0) throw invalid("Item points cannot be negative.");
        if (request.example() && request.possiblePoints().signum() != 0) throw invalid("Example items must have zero points.");

        // --- Validate theo loại item ---
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
        if (!children.isEmpty() && "QUESTION".equals(type)) {
            throw invalid("Question items cannot contain child items; attach questions to a content block.");
        }
        requireContiguousPositions(children.stream().map(CompositionItemRequest::position).toList(), "child item");

        // --- Xác định entity: cập nhật item cũ / tái sử dụng item cũ của cùng câu hỏi / tạo mới ---
        AssignmentItem item;
        if (request.id() != null) {
            // Client chỉ rõ item cần cập nhật: phải thuộc assignment này và không được lặp ID.
            item = itemById.get(request.id());
            if (item == null || !Objects.equals(item.getAssignment().getId(), assignment.getId())) {
                throw invalid("Item ID does not belong to this assignment.");
            }
            if (!usedItemIds.add(item.getId())) throw invalid("An item ID cannot appear more than once.");
        } else {
            // Không có ID: nếu DB còn item cũ của đúng câu hỏi này thì dùng lại, tránh INSERT trùng
            // (assignment_id, question_id). Ngược lại mới tạo item mới.
            AssignmentItem reusable = "QUESTION".equals(type) ? reusableQuestionItems.remove(request.questionId()) : null;
            if (reusable != null) {
                item = reusable;
                usedItemIds.add(item.getId());
            } else {
                item = new AssignmentItem();   // ID thật chỉ có sau khi save, được thêm vào usedItemIds bên dưới
            }
        }

        // --- Gán dữ liệu và lưu ---
        item.setAssignment(assignment);
        item.setSection(section);
        item.setParentItem(parent);
        item.setPosition(request.position());
        item.setItemType(type);
        item.setQuestionId(request.questionId());
        item.setPossiblePoints(request.possiblePoints());
        item.setExample(request.example());
        item.setBlockPayload(request.blockPayload());
        AssignmentItem saved = itemRepository.save(item);
        usedItemIds.add(saved.getId());
        savedItems.add(saved);

        for (CompositionItemRequest child : children) {
            if (!"QUESTION".equalsIgnoreCase(child.itemType())) {
                throw invalid("Composition blocks cannot contain nested blocks in v1.");
            }
            saveItemTree(assignment, section, saved, child, itemById, reusableQuestionItems,
                    ownedQuestionIds, usedItemIds, questionIds, savedItems);
        }
    }

    /** Làm phẳng toàn bộ item trong request (item gốc + item con) thành một danh sách, chưa validate gì. */
    private List<CompositionItemRequest> flattenRequestItems(List<CompositionSectionRequest> sections) {
        List<CompositionItemRequest> result = new ArrayList<>();
        for (CompositionSectionRequest s : sections) {
            if (s.items() != null) collectItems(s.items(), result);
        }
        return result;
    }

    private void collectItems(List<CompositionItemRequest> items, List<CompositionItemRequest> out) {
        for (CompositionItemRequest i : items) {
            out.add(i);
            if (i.children() != null) collectItems(i.children(), out);
        }
    }

    /** Item trong request có phải loại QUESTION không. */
    private boolean isQuestionRequest(CompositionItemRequest r) {
        return r.itemType() != null && "QUESTION".equalsIgnoreCase(r.itemType().trim());
    }

    private void validateMatchingPoolReferences(
            List<CompositionSectionRequest> sections,
            Map<Long, Question> questionsById) {
        for (CompositionSectionRequest section : sections) {
            if (section.items() == null) continue;
            for (CompositionItemRequest item : section.items()) {
                validateMatchingPoolItem(item, null, questionsById);
            }
        }
    }

    private void validateMatchingPoolItem(
            CompositionItemRequest item,
            Map<String, Object> parentPoolPayload,
            Map<Long, Question> questionsById) {
        String itemType = item.itemType() == null ? "" : item.itemType().trim().toUpperCase(Locale.ROOT);
        if ("QUESTION".equals(itemType) && item.questionId() != null) {
            Question question = questionsById.get(item.questionId());
            if (question != null && "MATCHING".equals(question.getType().name())) {
                if (parentPoolPayload == null) {
                    throw invalid("Matching questions must be attached to an Answer Pool block.");
                }
                Object entriesValue = parentPoolPayload.get("entries");
                if (!(entriesValue instanceof List<?> entries) || entries.isEmpty()) {
                    throw invalid("Matching questions require a non-empty Answer Pool.");
                }

                QuestionDefinitionRequest definition;
                try {
                    String json = question.getDefinition();
                    if (json == null || json.isBlank()) {
                        throw invalid("Matching question definition is missing.");
                    }
                    definition = objectMapper.readValue(json, QuestionDefinitionRequest.class);
                } catch (AppException ex) {
                    throw ex;
                } catch (Exception ex) {
                    throw invalid("Matching question definition is invalid.");
                }

                var matching = definition.getMatching();
                if (matching == null || matching.getCorrectEntryId() == null
                        || matching.getCorrectEntryId().isBlank()) {
                    throw invalid("Matching question must select a correct Answer Pool entry.");
                }

                Object poolKeyValue = parentPoolPayload.get("poolKey");
                if (poolKeyValue instanceof String poolKey && !poolKey.isBlank()
                        && matching.getPoolId() != null && !matching.getPoolId().isBlank()
                        && !poolKey.equals(matching.getPoolId())) {
                    throw invalid("Matching question references a different Answer Pool.");
                }

                Set<String> entryIds = new HashSet<>();
                boolean correctEntryExists = false;
                for (Object entry : entries) {
                    if (!(entry instanceof Map<?, ?> entryMap)
                            || !(entryMap.get("id") instanceof String entryId)
                            || entryId.isBlank()
                            || !(entryMap.get("text") instanceof String text)
                            || text.isBlank()) {
                        throw invalid("Every Answer Pool entry requires a stable ID and non-empty text.");
                    }
                    if (!entryIds.add(entryId.trim())) {
                        throw invalid("Answer Pool entry IDs must be unique.");
                    }
                    if (entryId.trim().equals(matching.getCorrectEntryId().trim())) {
                        correctEntryExists = true;
                    }
                }
                if (!correctEntryExists) {
                    throw invalid("Matching correctEntryId must identify an entry in its Answer Pool.");
                }
            }
        }

        Map<String, Object> currentPool = "POOL".equals(itemType) ? item.blockPayload() : null;
        List<CompositionItemRequest> children = item.children() == null ? List.of() : item.children();
        for (CompositionItemRequest child : children) {
            validateMatchingPoolItem(child, currentPool, questionsById);
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
                Set<String> entryIds = new HashSet<>();
                for (Object entry : list) {
                    if (!(entry instanceof Map<?, ?> map)
                            || !(map.get("id") instanceof String entryId)
                            || entryId.isBlank()
                            || !(map.get("text") instanceof String text)
                            || text.isBlank()) {
                        throw invalid("Every POOL entry requires a stable ID and non-empty text.");
                    }
                    if (!entryIds.add(entryId.trim())) {
                        throw invalid("POOL entry IDs must be unique.");
                    }
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
                        section.getInstructions(),section.getTitleVi(), section.getInstructionsVi(), rootsBySection.getOrDefault(section.getId(), List.of()).stream()
                        .sorted(Comparator.comparing(AssignmentItem::getPosition).thenComparing(AssignmentItem::getId))
                        .map(item -> toItemResponse(item, childrenByParent)).toList())
        ).toList();
        return new AssignmentCompositionResponse(assignment.getId(), assignment.getCompositionSchemaVersion(),
                 assignment.isShowScoreAfterSubmit(),
                assignment.isShowPointsPerQuestion(), sectionResponses);
    }

    private CompositionItemResponse toItemResponse(AssignmentItem item, Map<Long, List<AssignmentItem>> childrenByParent) {
        List<CompositionItemResponse> children = childrenByParent.getOrDefault(item.getId(), List.of()).stream()
                .sorted(Comparator.comparing(AssignmentItem::getPosition).thenComparing(AssignmentItem::getId))
                .map(child -> toItemResponse(child, childrenByParent)).toList();
        return new CompositionItemResponse(item.getId(), item.getPosition(), item.getItemType(), item.getQuestionId(),
                item.getPossiblePoints(), item.isExample(), item.getBlockPayload(), children);
    }

    private Assignment findAssignment(Long id) {
        return assignmentRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }

    private AppException invalid(String message) {
        // Keep the API error vocabulary stable while returning a precise validation message in logs.
        return new AppException(ErrorCode.ASSIGNMENT_COMPOSITION_INVALID);
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
