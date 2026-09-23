package e_learning.server.content.unit.repository;

import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.unit.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnitRepository extends JpaRepository<Unit, Long> {

    boolean existsByGradeIdAndCodeIgnoreCase(Long gradeId, String code);

    boolean existsByGradeIdAndCodeAndIdNot(Long gradeId,String code,Long id);

    List<Unit> findAllByGradeIdOrderByDisplayOrderAsc(Long gradeId);

    List<Unit> findAllByGradeIdAndStatusNotOrderByDisplayOrderAsc(Long gradeId, ContentStatus status);
}
