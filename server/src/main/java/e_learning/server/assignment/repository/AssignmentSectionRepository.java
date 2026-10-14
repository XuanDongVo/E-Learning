package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.AssignmentSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentSectionRepository extends JpaRepository<AssignmentSection, Long> {
    List<AssignmentSection> findAllByAssignmentIdOrderByPositionAscIdAsc(Long assignmentId);
}
