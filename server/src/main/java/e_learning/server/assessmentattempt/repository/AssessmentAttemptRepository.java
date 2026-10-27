package e_learning.server.assessmentattempt.repository;

import e_learning.server.assessmentattempt.entity.AssessmentAttempt;
import e_learning.server.assessmentattempt.enums.AssessmentAttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    Optional<AssessmentAttempt> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    boolean existsByAssignmentId(Long assignmentId);

    boolean existsByAssignmentIdAndStatus(Long assignmentId, AssessmentAttemptStatus status);

    boolean exitsByByAssignmentIdAndUser_Id(Long assignmentId, Long userId);
}
