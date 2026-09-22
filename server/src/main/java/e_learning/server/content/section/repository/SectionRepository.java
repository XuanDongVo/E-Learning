package e_learning.server.content.section.repository;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.section.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByUnitIdAndStatusOrderByDisplayOrderAsc(Long unitId, ContentStatus status);
    boolean existsByUnitIdAndNameIgnoreCase(Long unitId, String name);
}
