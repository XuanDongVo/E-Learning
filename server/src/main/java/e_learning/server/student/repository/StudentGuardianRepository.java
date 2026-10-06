package e_learning.server.student.repository;

import e_learning.server.student.entity.StudentGuardian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface StudentGuardianRepository extends JpaRepository<StudentGuardian, Long> {
    List<StudentGuardian> findAllByStudentProfileIdOrderByPrimaryDescIdAsc(Long studentProfileId);
    List<StudentGuardian> findAllByStudentProfileIdInOrderByPrimaryDescIdAsc(Collection<Long> studentProfileIds);
}
