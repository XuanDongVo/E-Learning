package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.AssignmentSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentSectionRepository extends JpaRepository<AssignmentSection, Long> {
    List<AssignmentSection> findAllByAssignmentIdOrderByPositionAscIdAsc(Long assignmentId);

    @Modifying
    @Query("update AssignmentSection s set s.position = s.position + 1000000 where s.assignment.id = :assignmentId")
    int shiftPositionsForReplacement(@Param("assignmentId") Long assignmentId);
}
