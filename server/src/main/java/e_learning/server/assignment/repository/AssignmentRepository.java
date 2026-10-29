package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findAllByStatusNotOrderByDueAtAscIdAsc(AssignmentStatus status);
    List<Assignment> findAllByStatusOrderByDueAtAscIdAsc(AssignmentStatus status);
    boolean existsByGrade_IdAndAcademicYearAndNameIgnoreCase(Long gradeId, String academicYear, String name);
}
