package e_learning.server.knowledge.teacher.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.topic.entity.Topic;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.entity.KnowledgeNoteTopicLink;
import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import e_learning.server.knowledge.repository.KnowledgeNoteRepository;
import e_learning.server.knowledge.repository.KnowledgeNoteTopicLinkRepository;
import e_learning.server.knowledge.teacher.dto.response.KnowledgeNoteTopicUsageResponse;
import e_learning.server.knowledge.teacher.dto.response.TopicKnowledgeNoteLinkResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TeacherKnowledgeNoteLinkService {
    private final TopicRepository topicRepository;
    private final KnowledgeNoteRepository noteRepository;
    private final KnowledgeNoteTopicLinkRepository linkRepository;

    @Transactional(readOnly = true)
    public List<TopicKnowledgeNoteLinkResponse> listForTopic(Long topicId) {
        findTopic(topicId);
        return linkRepository.findByTopicIdOrderByDisplayOrderAsc(topicId).stream()
                .sorted(Comparator.comparing(KnowledgeNoteTopicLink::isPrimary).reversed()
                        .thenComparing(KnowledgeNoteTopicLink::getDisplayOrder)
                        .thenComparing(KnowledgeNoteTopicLink::getId))
                .map(TeacherKnowledgeNoteLinkService::toLinkResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<KnowledgeNoteTopicUsageResponse> listForNote(Long noteId) {
        findNote(noteId);
        return linkRepository.findByNoteId(noteId).stream()
                .sorted(Comparator.comparing((KnowledgeNoteTopicLink link) ->
                        link.getTopic().getSection().getUnit().getId())
                        .thenComparing(link -> link.getTopic().getName()))
                .map(link -> {
                    var topic = link.getTopic();
                    var section = topic.getSection();
                    var unit = section.getUnit();
                    return new KnowledgeNoteTopicUsageResponse(
                            topic.getId(), topic.getName(), section.getId(), section.getName(),
                            unit.getId(), unit.getName(), link.isPrimary(), link.getDisplayOrder(),
                            topic.getStatus());
                }).toList();
    }

    @Transactional
    public List<TopicKnowledgeNoteLinkResponse> link(Long topicId, Long noteId, boolean primary) {
        Topic topic = findTopic(topicId);
        if (topic.getStatus() == ContentStatus.ARCHIVED) {
            throw new AppException(ErrorCode.KNOWLEDGE_NOTE_LINK_INVALID,
                    "Không thể thay đổi liên kết của Topic đã lưu trữ.");
        }
        KnowledgeNote note = findNote(noteId);
        if (!Objects.equals(topic.getSection().getUnit().getGrade().getId(), note.getGrade().getId())) {
            throw new AppException(ErrorCode.KNOWLEDGE_NOTE_LINK_INVALID,
                    "Knowledge Note và Topic phải thuộc cùng một khối.");
        }
        if (note.getStatus() != KnowledgeNoteStatus.PUBLISHED) {
            throw new AppException(ErrorCode.KNOWLEDGE_NOTE_LINK_INVALID,
                    "Chỉ có thể gắn bài lý thuyết đã công bố.");
        }
        var links = linkRepository.findByTopicIdOrderByDisplayOrderAsc(topicId);
        KnowledgeNoteTopicLink target = links.stream()
                .filter(link -> link.getNote().getId().equals(noteId)).findFirst().orElse(null);

        if (primary) {
            // PostgreSQL partial unique index permits only one primary per Topic.
            // Flush the demotion before promoting/inserting the new primary.
            boolean demoted = false;
            for (KnowledgeNoteTopicLink link : links) {
                if (link.isPrimary() && (target == null || !link.getId().equals(target.getId()))) {
                    link.setPrimary(false);
                    demoted = true;
                }
            }
            if (demoted) linkRepository.flush();
        }

        if (target == null) {
            int nextOrder = links.stream().mapToInt(KnowledgeNoteTopicLink::getDisplayOrder)
                    .max().orElse(-1) + 1;
            target = new KnowledgeNoteTopicLink();
            target.setTopic(topic);
            target.setNote(note);
            target.setDisplayOrder(nextOrder);
        }
        target.setPrimary(primary);
        linkRepository.saveAndFlush(target);
        return listForTopic(topicId);
    }

    @Transactional
    public List<TopicKnowledgeNoteLinkResponse> unlink(Long topicId, Long noteId) {
        findTopic(topicId);
        var link = linkRepository.findByTopicIdOrderByDisplayOrderAsc(topicId).stream()
                .filter(item -> item.getNote().getId().equals(noteId)).findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.KNOWLEDGE_NOTE_LINK_NOT_FOUND));
        linkRepository.delete(link);
        linkRepository.flush();
        return listForTopic(topicId);
    }

    @Transactional
    public List<TopicKnowledgeNoteLinkResponse> reorderSupplementary(Long topicId, List<Long> noteIds) {
        Topic topic = findTopic(topicId);
        if (topic.getStatus() == ContentStatus.ARCHIVED) {
            throw new AppException(ErrorCode.KNOWLEDGE_NOTE_LINK_INVALID,
                    "Không thể sắp xếp liên kết của Topic đã lưu trữ.");
        }
        var supplementary = linkRepository.findByTopicIdOrderByDisplayOrderAsc(topicId).stream()
                .filter(link -> !link.isPrimary()).toList();
        if (noteIds == null || noteIds.size() != supplementary.size()
                || noteIds.stream().anyMatch(Objects::isNull)
                || new HashSet<>(noteIds).size() != noteIds.size()
                || !new HashSet<>(supplementary.stream().map(link -> link.getNote().getId()).toList())
                    .equals(new HashSet<>(noteIds))) {
            throw new AppException(ErrorCode.KNOWLEDGE_NOTE_LINK_INVALID,
                    "Danh sách sắp xếp phải chứa đúng tất cả tài liệu bổ sung.");
        }
        for (var link : supplementary) {
            link.setDisplayOrder(noteIds.indexOf(link.getNote().getId()));
        }
        linkRepository.saveAllAndFlush(supplementary);
        return listForTopic(topicId);
    }

    private Topic findTopic(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
    }

    private KnowledgeNote findNote(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.KNOWLEDGE_NOTE_NOT_FOUND));
    }

    private static TopicKnowledgeNoteLinkResponse toLinkResponse(KnowledgeNoteTopicLink link) {
        var note = link.getNote();
        return new TopicKnowledgeNoteLinkResponse(
                note.getId(), link.getId(), note.getGrade().getId(),
                note.getTitle(), note.getDescription(), note.getStatus(),
                link.isPrimary(), link.getDisplayOrder());
    }
}
