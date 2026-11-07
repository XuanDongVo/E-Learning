package e_learning.server.activitysession.repository;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activitysession.entity.ActivitySession;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ActivitySessionRepository extends JpaRepository<ActivitySession, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ActivitySession s where s.id = :id")
    java.util.Optional<ActivitySession> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select s from ActivitySession s
            where s.student.id = :studentId and s.status in :statuses
            order by s.id
            """)
    List<ActivitySession> findAllByStudentIdAndStatusInForUpdate(
            @Param("studentId") Long studentId,
            @Param("statuses") Collection<ActivitySessionStatus> statuses);

    @Query("""
            select s from ActivitySession s
            join fetch s.activity act
            join fetch act.unit
            where s.student.id = :studentId
            order by s.startedAt desc
            """)
    List<ActivitySession> findAllByStudentIdWithActivityOrderByStartedAtDesc(@Param("studentId") Long studentId);

    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, ActivitySessionStatus status);

    @EntityGraph(attributePaths = {"activity", "activity.unit"})
    @Query("""
            select s from ActivitySession s
            where s.student.id = :studentId
              and (:mode is null or s.mode = :mode)
              and (:status is null or s.status = :status)
            """)
    Page<ActivitySession> searchByStudent(
            @Param("studentId") Long studentId,
            @Param("mode") ActivityMode mode,
            @Param("status") ActivitySessionStatus status,
            Pageable pageable
    );
}
