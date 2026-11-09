package e_learning.server.assignment.repository;

import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findAllByStatusNotOrderByDueAtAscIdAsc(AssignmentStatus status);
    List<Assignment> findAllByStatusOrderByDueAtAscIdAsc(AssignmentStatus status);

    @Query(value = """
            select distinct assignment.*
            from assignments assignment
            where assignment.status <> 'ARCHIVED'
              and exists (
                  select 1
                  from jsonb_array_elements_text(assignment.class_ids)
                       as recipient(class_id_text)
                  join classes class_entity
                    on class_entity.id = cast(recipient.class_id_text as bigint)
                  where class_entity.teacher_id = :teacherId
              )
            order by assignment.due_at asc, assignment.id asc
            """, nativeQuery = true)
    List<Assignment> findAllVisibleToTeacherExcludingArchived(
            @Param("teacherId") Long teacherId);

    boolean existsByGrade_IdAndAcademicYearAndNameIgnoreCase(Long gradeId, String academicYear, String name);
}
