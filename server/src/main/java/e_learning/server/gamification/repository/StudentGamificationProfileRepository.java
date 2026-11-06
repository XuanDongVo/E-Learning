package e_learning.server.gamification.repository;

import e_learning.server.gamification.entity.StudentGamificationProfile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;

/**
 * A future reward writer must lock the profile row during crediting.
 * For a student's first reward, create-if-absent must also handle concurrent
 * insert racing on the existing UNIQUE(student_id) constraint.
 */
public interface StudentGamificationProfileRepository extends JpaRepository<StudentGamificationProfile, Long> {
    Optional<StudentGamificationProfile> findByStudentId(Long studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<StudentGamificationProfile> findWithLockByStudentId(Long studentId);
}
