package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.AssignmentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentItemRepository extends JpaRepository<AssignmentItem, Long> {
    List<AssignmentItem> findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(Long assignmentId);
    List<AssignmentItem> findAllByAssignmentIdAndSectionIdOrderByPositionAscIdAsc(Long assignmentId, Long sectionId);

    @Modifying
    @Query("update AssignmentItem i set i.position = i.position + 1000000 where i.assignment.id = :assignmentId")
    int shiftPositionsForReplacement(@Param("assignmentId") Long assignmentId);
}
