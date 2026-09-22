package e_learning.server.content.unit.repository;

import e_learning.server.content.unit.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    List<Unit> findByGradeIdAndStatusOrderByDisplayOrderAsc(Long gradeId, e_learning.server.content.common.enums.ContentStatus status);
    boolean existsByGradeIdAndCodeIgnoreCase(Long gradeId, String code);
}
