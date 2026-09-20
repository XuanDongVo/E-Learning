package e_learning.server.grades.repository;

import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.entity.GradeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findAllByStatusOrderByDisplayOrderAsc(GradeStatus status);
    List<Grade> findAllByOrderByDisplayOrderAsc();
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}