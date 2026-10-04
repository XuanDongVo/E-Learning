package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.AssignmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentQuestionRepository extends JpaRepository<AssignmentQuestion, Long> {
    List<AssignmentQuestion> findAllByAssignmentIdOrderByPositionAsc(Long assignmentId);
    long countByAssignmentId(Long assignmentId);
}
