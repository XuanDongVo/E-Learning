package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.AssignmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AssignmentQuestionRepository extends JpaRepository<AssignmentQuestion, Long> {

    List<AssignmentQuestion> findAllByAssignmentId(Long assignmentId);

    long countByAssignmentId(Long assignmentId);

    Optional<AssignmentQuestion> findByAssignmentIdAndQuestionId(Long assignmentId, Long questionId);

    List<AssignmentQuestion> findAllByAssignmentIdAndQuestionIdIn(
            Long assignmentId,
            Collection<Long> questionIds
    );
}
