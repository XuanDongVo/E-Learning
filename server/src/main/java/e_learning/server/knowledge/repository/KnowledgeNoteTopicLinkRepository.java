package e_learning.server.knowledge.repository;

import e_learning.server.knowledge.entity.KnowledgeNoteTopicLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KnowledgeNoteTopicLinkRepository extends JpaRepository<KnowledgeNoteTopicLink, Long> {
    List<KnowledgeNoteTopicLink> findByTopicIdOrderByDisplayOrderAsc(Long topicId);
    List<KnowledgeNoteTopicLink> findByNoteId(Long noteId);
    long countByNoteId(Long noteId);
    boolean existsByTopicIdAndPrimaryTrue(Long topicId);
    boolean existsByNoteIdAndTopicId(Long noteId, Long topicId);
}
