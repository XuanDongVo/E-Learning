package e_learning.server.activity.repository;

import e_learning.server.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    boolean existsByTopicIdAndNameIgnoreCase(Long topicId, String name);

    boolean existsByTopicIdAndNameIgnoreCaseAndIdNot(Long topicId, String name, Long id);
}