package e_learning.server.studyplanner.repository;

import e_learning.server.studyplanner.entity.StudentStudyTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentStudyTaskRepository extends JpaRepository<StudentStudyTask, Long> {
    List<StudentStudyTask> findByStudentIdOrderByCompletedAscPlannedDateAscCreatedAtDesc(Long studentId);
    Optional<StudentStudyTask> findByIdAndStudentId(Long id, Long studentId);
}
