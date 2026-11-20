package e_learning.server.content.topic.repository;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.topic.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    /** Serialize Teacher link writes per Topic, in addition to the DB unique index. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Topic t where t.id = :id")
    Optional<Topic> findByIdForUpdate(Long id);

    List<Topic> findBySectionIdAndStatusOrderByDisplayOrderAsc(Long sectionId, ContentStatus status);

    boolean existsBySectionIdAndNameIgnoreCase(Long sectionId, String name);

    boolean existsBySectionIdAndNameIgnoreCaseAndIdNot(Long sectionId, String name, Long id);

    List<Topic> findAllBySectionIdOrderByDisplayOrderAsc(Long sectionId);

    long countBySectionUnitId(Long unitId);

    int countBySectionId(Long sectionId);

    List<Topic> findAllBySectionIdAndStatusNotOrderByDisplayOrderAsc(Long sectionId, ContentStatus status);

}
