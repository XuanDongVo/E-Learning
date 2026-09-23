package e_learning.server.content.topic.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.common.dto.UpdateStatusRequest;
import e_learning.server.content.section.entity.Section;
import e_learning.server.content.section.repository.SectionRepository;
import e_learning.server.content.topic.dto.CreateTopicRequest;
import e_learning.server.content.topic.dto.TopicResponse;
import e_learning.server.content.topic.dto.UpdateTopicRequest;
import e_learning.server.content.topic.entity.Topic;
import e_learning.server.content.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicService {
    private final TopicRepository topicRepository;
    private final SectionRepository sectionRepository;

    public TopicResponse create(CreateTopicRequest request) {
        Section section = sectionRepository.findById(request.sectionId()).orElseThrow(() -> new AppException(ErrorCode.SECTION_NOT_FOUND));
        String name = request.name().trim();
        if (topicRepository.existsBySectionIdAndNameIgnoreCase(request.sectionId(), name)) throw new AppException(ErrorCode.TOPIC_ALREADY_EXISTS);
        Topic topic = Topic.builder().section(section).name(name).description(request.description()).displayOrder(request.displayOrder() == null ? nextOrder(request.sectionId()) : request.displayOrder()).status(ContentStatus.DRAFT).build();
        return toResponse(topicRepository.save(topic));
    }

    @Transactional(readOnly = true)
    public TopicResponse get(Long id) { return toResponse(find(id)); }

    @Transactional(readOnly = true)
    public List<TopicResponse> list(Long sectionId, boolean includeArchived) {
        if (!sectionRepository.existsById(sectionId)) throw new AppException(ErrorCode.SECTION_NOT_FOUND);
        List<Topic> topics = (includeArchived
            ? topicRepository.findAllBySectionIdOrderByDisplayOrderAsc(sectionId)
            : topicRepository.findAllBySectionIdAndStatusNotOrderByDisplayOrderAsc(sectionId, ContentStatus.ARCHIVED));
        return topics.stream().map(this::toResponse).toList();
    }

    public TopicResponse update(Long id, UpdateTopicRequest request) {
        Topic topic = find(id);
        String name = request.name().trim();
        if (topicRepository.existsBySectionIdAndNameIgnoreCaseAndIdNot(topic.getSection().getId(), name, id)) throw new AppException(ErrorCode.TOPIC_ALREADY_EXISTS);
        topic.setName(name); topic.setDescription(request.description());
        if (request.displayOrder() != null) topic.setDisplayOrder(request.displayOrder());
        return toResponse(topicRepository.save(topic));
    }

    public TopicResponse archive(Long id) {
        Topic topic = find(id); topic.setStatus(ContentStatus.ARCHIVED); return toResponse(topicRepository.save(topic));
    }

    public TopicResponse updateStatus(Long id, UpdateStatusRequest request) {
        Topic topic = find(id);
        topic.setStatus(request.status());
        return toResponse(topicRepository.save(topic));
    }

    public void reorder(Long sectionId, ReorderRequest request) {
        List<Topic> topics = topicRepository.findAllBySectionIdAndStatusNotOrderByDisplayOrderAsc(sectionId, ContentStatus.ARCHIVED);
        if (topics.size() != request.items().size() || request.items().stream().map(ReorderRequest.Item::id).distinct().count() != topics.size()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        var byId = topics.stream().collect(java.util.stream.Collectors.toMap(Topic::getId, topic -> topic));
        request.items().forEach(item -> {
            Topic topic = byId.get(item.id());
            if (topic == null) throw new AppException(ErrorCode.INVALID_REQUEST);
            topic.setDisplayOrder(item.displayOrder());
        });
        topicRepository.saveAll(topics);
    }

    private int nextOrder(Long sectionId) { return (int) topicRepository.countBySectionId(sectionId); }
    private Topic find(Long id) { return topicRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND)); }
    private TopicResponse toResponse(Topic topic) { return TopicResponse.from(topic, 0); }
}
