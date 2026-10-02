package e_learning.server.activity.repository;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findAllByUnitIdOrderByDisplayOrderAscIdAsc(Long unitId);

    List<Activity> findAllByUnitIdAndStatusNotOrderByDisplayOrderAscIdAsc(
        Long unitId,
        ActivityStatus status
    );

    boolean existsByUnitIdAndNameIgnoreCase(Long unitId, String name);

    boolean existsByUnitIdAndNameIgnoreCaseAndIdNot(
        Long unitId,
        String name,
        Long id
    );

    @Query("select coalesce(max(a.displayOrder), 0) from Activity a where a.unit.id = :unitId")
    int findMaxDisplayOrderByUnitId(@Param("unitId") Long unitId);
}
