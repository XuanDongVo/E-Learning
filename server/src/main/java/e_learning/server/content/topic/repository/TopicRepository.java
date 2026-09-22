package e_learning.server.content.topic.repository;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.topic.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findBySectionIdAndStatusOrderByDisplayOrderAsc(Long sectionId, ContentStatus status);
    boolean existsBySectionIdAndNameIgnoreCase(Long sectionId, String name);
}
