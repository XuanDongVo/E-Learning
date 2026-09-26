package e_learning.server.content.questionBank.repository;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.questionBank.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    List<QuestionBank> findByTopicIdOrderByDisplayOrderAsc(Long topicId);
    List<QuestionBank> findByTopicIdAndStatusInOrderByDisplayOrderAsc(Long topicId, List<ContentStatus> statuses);
    List<QuestionBank> findByTopicIdAndStatusOrderByDisplayOrderAsc(Long topicId, ContentStatus status);
    boolean existsByTopicIdAndNameIgnoreCase(Long topicId, String name);
    boolean existsByTopicIdAndNameIgnoreCaseAndIdNot(Long topicId, String name, Long id);
}
