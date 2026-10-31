package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    Optional<AssessmentAttempt> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from AssessmentAttempt a where a.assignment.id = :assignmentId and a.student.id = :studentId")
    Optional<AssessmentAttempt> findByAssignmentIdAndStudentIdForUpdate(
            @Param("assignmentId") Long assignmentId,
            @Param("studentId") Long studentId);

    boolean existsByAssignmentId(Long assignmentId);

    boolean existsByAssignmentIdAndStatus(Long assignmentId, AssessmentAttemptStatus status);

    boolean existsByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
}
