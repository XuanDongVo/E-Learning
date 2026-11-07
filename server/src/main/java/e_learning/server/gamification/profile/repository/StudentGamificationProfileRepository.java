package e_learning.server.gamification.profile.repository;

import e_learning.server.gamification.profile.entity.StudentGamificationProfile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

/** Profile access for start snapshots and the atomic reward writer. */
public interface StudentGamificationProfileRepository extends JpaRepository<StudentGamificationProfile, Long> {
    Optional<StudentGamificationProfile> findByStudentId(Long studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<StudentGamificationProfile> findWithLockByStudentId(Long studentId);

    /** Race-safe first profile creation; the unique student_id remains authoritative. */
    @Modifying(flushAutomatically = true)
    @Query(value = """
            insert into student_gamification_profiles
                (student_id, lifetime_xp, current_level, current_streak, longest_streak, created_at, updated_at)
            values (:studentId, 0, 1, 0, 0, now(), now())
            on conflict (student_id) do nothing
            """, nativeQuery = true)
    int insertIfAbsent(@Param("studentId") Long studentId);
}
