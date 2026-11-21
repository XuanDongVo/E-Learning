package e_learning.server.knowledge.student.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.entity.KnowledgeNoteTopicLink;
import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import e_learning.server.knowledge.repository.KnowledgeNoteRepository;
import e_learning.server.knowledge.repository.KnowledgeNoteTopicLinkRepository;
import e_learning.server.knowledge.student.dto.StudentKnowledgeNoteDetail;
import e_learning.server.knowledge.student.dto.StudentKnowledgeNoteSummary;
import e_learning.server.knowledge.student.dto.StudentKnowledgeUnitTag;
import e_learning.server.knowledge.student.dto.StudentKnowledgeTopicTag;
import e_learning.server.knowledge.student.dto.StudentTopicKnowledgeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentKnowledgeNoteService {
    private final KnowledgeNoteRepository notes;
    private final TopicRepository topics;
    private final KnowledgeNoteTopicLinkRepository links;
    private final StudentUnitService studentUnits;

    /**
     * The library includes PUBLISHED, same-grade Notes even when they are not linked
     * to a Topic. Unit filtering only matches links under visible published content.
     */
    public PageResponse<StudentKnowledgeNoteSummary> list(
            Long studentId, String search, Long unitId, Long topicId, int page, int size) {
        Long gradeId = studentUnits.getStudentGradeId(studentId);
        if (page < 1 || size < 1 || size > 50) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "page phải >= 1, size phải từ 1 đến 50.");
        }
        if (unitId != null) studentUnits.requireVisibleUnit(studentId, unitId);
        if (topicId != null) {
            var topic = topics.findById(topicId)
                    .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
            var section = topic.getSection();
            var unit = section.getUnit();
            if (topic.getStatus() != ContentStatus.PUBLISHED
                    || section.getStatus() != ContentStatus.PUBLISHED
                    || unit.getStatus() != ContentStatus.PUBLISHED
                    || !Objects.equals(unit.getGrade().getId(), gradeId)
                    || (unitId != null && !Objects.equals(unit.getId(), unitId))) {
                throw new AppException(ErrorCode.TOPIC_NOT_FOUND);
            }
        }

        Specification<KnowledgeNote> filter = (root, query, cb) -> cb.and(
                cb.equal(root.get("grade").get("id"), gradeId),
                cb.equal(root.get("status"), KnowledgeNoteStatus.PUBLISHED));

        if (search != null && !search.isBlank()) {
            String term = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            filter = filter.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), term),
                    cb.like(cb.lower(cb.coalesce(root.get("description"), "")), term)));
        }
        if (unitId != null || topicId != null) {
            filter = filter.and((root, query, cb) -> {
                var sub = query.subquery(Long.class);
                var link = sub.from(KnowledgeNoteTopicLink.class);
                sub.select(link.get("id"));
                var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
                predicates.add(cb.equal(link.get("note").get("id"), root.get("id")));
                predicates.add(cb.equal(link.get("topic").get("status"), ContentStatus.PUBLISHED));
                predicates.add(cb.equal(link.get("topic").get("section").get("status"), ContentStatus.PUBLISHED));
                predicates.add(cb.equal(link.get("topic").get("section").get("unit").get("status"), ContentStatus.PUBLISHED));
                if (unitId != null) predicates.add(cb.equal(link.get("topic").get("section").get("unit").get("id"), unitId));
                if (topicId != null) predicates.add(cb.equal(link.get("topic").get("id"), topicId));
                sub.where(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
                return cb.exists(sub);
            });
        }
        var result = notes.findAll(filter, PageRequest.of(
                page - 1, size, Sort.by(Sort.Direction.DESC, "updatedAt")
                        .and(Sort.by(Sort.Direction.DESC, "id"))));
        var summaries = result.getContent().stream().map(note ->
                new StudentKnowledgeNoteSummary(note.getId(), note.getTitle(),
                        note.getDescription(), note.getUpdatedAt(), visibleUnits(note, gradeId)))
                .toList();
        return PageResponse.from(result, summaries);
    }

    /** A URL ID is never sufficient authorization; reveal neither drafts nor other grades. */
    public StudentKnowledgeNoteDetail get(Long studentId, Long noteId) {
        Long gradeId = studentUnits.getStudentGradeId(studentId);
        KnowledgeNote note = notes.findById(noteId)
                .filter(n -> n.getStatus() == KnowledgeNoteStatus.PUBLISHED
                        && Objects.equals(n.getGrade().getId(), gradeId))
                .orElseThrow(() -> new AppException(ErrorCode.KNOWLEDGE_NOTE_NOT_FOUND));
        return new StudentKnowledgeNoteDetail(note.getId(), note.getTitle(),
                note.getDescription(), note.getUpdatedAt(), note.getDocumentJson(),
                visibleTopicLinks(note, gradeId).stream().map(link -> {
                    var topic = link.getTopic();
                    var unit = topic.getSection().getUnit();
                    return new StudentKnowledgeTopicTag(topic.getId(), topic.getName(),
                            unit.getId(), unit.getCode(), unit.getName(), link.isPrimary());
                }).toList());
    }


    /**
     * S03.2: read-only Topic knowledge. Never disclose linked drafts or hidden
     * Topics. Grade is derived from the authenticated active Student class.
     */
    public StudentTopicKnowledgeResponse forTopic(Long studentId, Long topicId) {
        Long gradeId = studentUnits.getStudentGradeId(studentId);
        var topic = topics.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
        var section = topic.getSection();
        var unit = section.getUnit();
        if (topic.getStatus() != ContentStatus.PUBLISHED
                || section.getStatus() != ContentStatus.PUBLISHED
                || unit.getStatus() != ContentStatus.PUBLISHED
                || !Objects.equals(unit.getGrade().getId(), gradeId)) {
            throw new AppException(ErrorCode.TOPIC_NOT_FOUND);
        }
        studentUnits.requireVisibleUnit(studentId, unit.getId());

        StudentTopicKnowledgeResponse.PrimaryNote primary = null;
        var supplementary = new ArrayList<StudentTopicKnowledgeResponse.ReadingNote>();
        for (KnowledgeNoteTopicLink link : links.findByTopicIdOrderByDisplayOrderAsc(topicId)) {
            var note = link.getNote();
            if (note.getStatus() != KnowledgeNoteStatus.PUBLISHED
                    || !Objects.equals(note.getGrade().getId(), gradeId)) continue;
            if (link.isPrimary()) {
                var excerpt = keyPointExcerpt(note.getDocumentJson(), 3);
                primary = new StudentTopicKnowledgeResponse.PrimaryNote(
                        note.getId(), note.getTitle(), note.getDescription(),
                        excerpt.document(), excerpt.total());
            } else {
                supplementary.add(new StudentTopicKnowledgeResponse.ReadingNote(
                        note.getId(), note.getTitle(), note.getDescription()));
            }
        }
        return new StudentTopicKnowledgeResponse(topicId, primary, supplementary);
    }

    private record Excerpt(Map<String, Object> document, int total) {}

    /**
     * Copy only marked learning blocks/tables and their nearest H2/H3 heading
     * from stored Tiptap JSON. Retain original node semantics and safe renderer
     * contract; never infer an example or generate a second curriculum copy.
     */
    private static Excerpt keyPointExcerpt(Map<String, Object> document, int limit) {
        var output = new ArrayList<Object>();
        Object lastHeading = null;
        Object renderedHeading = null;
        int total = 0;
        Object raw = document == null ? null : document.get("content");
        if (raw instanceof List<?> nodes) {
            for (Object item : nodes) {
                if (!(item instanceof Map<?, ?> node)) continue;
                Object type = node.get("type");
                if ("heading".equals(type)) {
                    lastHeading = item;
                } else if ("table".equals(type) || "learningBlock".equals(type)) {
                    Object attrs = node.get("attrs");
                    boolean key = attrs instanceof Map<?, ?> meta
                            && Boolean.TRUE.equals(meta.get("isKeyPoint"));
                    if (!key) continue;
                    total++;
                    if (total > limit) continue;
                    if (lastHeading != null && lastHeading != renderedHeading) {
                        output.add(lastHeading);
                        renderedHeading = lastHeading;
                    }
                    output.add(item);
                }
            }
        }
        return new Excerpt(Map.of("type", "doc", "content", output), total);
    }

    /** Public Student backlink projection: no hidden Topic, Unit or cross-grade metadata. */
    private List<KnowledgeNoteTopicLink> visibleTopicLinks(KnowledgeNote note, Long gradeId) {
        return links.findByNoteId(note.getId()).stream()
                .filter(link -> {
                    var topic = link.getTopic();
                    var section = topic.getSection();
                    var unit = section.getUnit();
                    return topic.getStatus() == ContentStatus.PUBLISHED
                            && section.getStatus() == ContentStatus.PUBLISHED
                            && unit.getStatus() == ContentStatus.PUBLISHED
                            && Objects.equals(unit.getGrade().getId(), gradeId);
                })
                .sorted((a, b) -> {
                    int primaryOrder = Boolean.compare(b.isPrimary(), a.isPrimary());
                    if (primaryOrder != 0) return primaryOrder;
                    int unitOrder = a.getTopic().getSection().getUnit().getCode()
                            .compareToIgnoreCase(b.getTopic().getSection().getUnit().getCode());
                    return unitOrder != 0 ? unitOrder : Long.compare(a.getTopic().getId(), b.getTopic().getId());
                })
                .toList();
    }

    private List<StudentKnowledgeUnitTag> visibleUnits(KnowledgeNote note, Long gradeId) {
        return links.findByNoteId(note.getId()).stream()
                .map(link -> link.getTopic())
                .filter(topic -> topic.getStatus() == ContentStatus.PUBLISHED
                        && topic.getSection().getStatus() == ContentStatus.PUBLISHED
                        && topic.getSection().getUnit().getStatus() == ContentStatus.PUBLISHED
                        && Objects.equals(topic.getSection().getUnit().getGrade().getId(), gradeId))
                .map(topic -> topic.getSection().getUnit())
                .collect(Collectors.toMap(unit -> unit.getId(),
                        unit -> new StudentKnowledgeUnitTag(unit.getId(), unit.getCode(), unit.getName()),
                        (first, ignored) -> first))
                .values().stream()
                .sorted((a, b) -> a.code().compareToIgnoreCase(b.code()))
                .toList();
    }
}
