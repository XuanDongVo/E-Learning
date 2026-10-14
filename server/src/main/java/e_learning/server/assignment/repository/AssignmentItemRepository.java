package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.AssignmentItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentItemRepository extends JpaRepository<AssignmentItem, Long> {
    List<AssignmentItem> findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(Long assignmentId);
    List<AssignmentItem> findAllByAssignmentIdAndSectionIdOrderByPositionAscIdAsc(Long assignmentId, Long sectionId);
}
