package e_learning.server.knowledge.teacher.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.grades.repository.GradeRepository;
import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import e_learning.server.knowledge.repository.KnowledgeNoteRepository;
import e_learning.server.knowledge.repository.KnowledgeNoteTopicLinkRepository;
import e_learning.server.knowledge.teacher.dto.request.CreateKnowledgeNoteRequest;
import e_learning.server.knowledge.teacher.dto.response.KnowledgeNoteResponse;
import e_learning.server.knowledge.teacher.mapper.KnowledgeNoteMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherKnowledgeNoteService {
    private final KnowledgeNoteRepository noteRepository;
    private final KnowledgeNoteTopicLinkRepository linkRepository;
    private final GradeRepository gradeRepository;
    private final KnowledgeNoteMapper mapper;

    @Transactional
    public KnowledgeNoteResponse create(CreateKnowledgeNoteRequest request) {
        var grade = gradeRepository.findById(request.gradeId())
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));

        var note = new KnowledgeNote();
        note.setGrade(grade);
        note.setTitle(request.title().trim());
        note.setDescription(normalizeDescription(request.description()));
        note.setStatus(KnowledgeNoteStatus.DRAFT);
        var emptyDocument = JsonNodeFactory.instance.objectNode();
        emptyDocument.put("type", "doc");
        emptyDocument.set("content", JsonNodeFactory.instance.arrayNode());
        note.setDocumentJson(emptyDocument);
        return mapper.toResponse(noteRepository.save(note), 0);
    }

    @Transactional(readOnly = true)
    public KnowledgeNoteResponse get(Long id) {
        KnowledgeNote note = noteRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.KNOWLEDGE_NOTE_NOT_FOUND));
        return mapper.toResponse(note, linkRepository.countByNoteId(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<KnowledgeNoteResponse> list(
            Long gradeId, KnowledgeNoteStatus status, String search, Boolean linked,
            int page, int size) {
        if (page < 1 || size < 1 || size > 100) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                    "page phải >= 1 và size từ 1 đến 100");
        }
        Specification<KnowledgeNote> filter = (root, query, cb) -> cb.conjunction();
        if (gradeId != null) filter = filter.and((root, query, cb) ->
                cb.equal(root.get("grade").get("id"), gradeId));
        if (status != null) filter = filter.and((root, query, cb) ->
                cb.equal(root.get("status"), status));
        if (search != null && !search.isBlank()) {
            String term = "%" + search.trim().toLowerCase(java.util.Locale.ROOT) + "%";
            filter = filter.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), term),
                    cb.like(cb.lower(root.get("description")), term)));
        }
        if (linked != null) filter = filter.and((root, query, cb) -> {
            var sub = query.subquery(Long.class);
            var link = sub.from(e_learning.server.knowledge.entity.KnowledgeNoteTopicLink.class);
            sub.select(link.get("id"));
            sub.where(cb.equal(link.get("note").get("id"), root.get("id")));
            return linked ? cb.exists(sub) : cb.not(cb.exists(sub));
        });

        var result = noteRepository.findAll(filter,
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "updatedAt")
                        .and(Sort.by(Sort.Direction.DESC, "id"))));
        var mapped = result.getContent().stream()
                .map(note -> mapper.toResponse(note, linkRepository.countByNoteId(note.getId())))
                .toList();
        return PageResponse.from(result, mapped);
    }

    private static String normalizeDescription(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
