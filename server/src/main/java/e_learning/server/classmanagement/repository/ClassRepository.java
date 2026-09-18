package e_learning.server.classmanagement.repository;

import e_learning.server.classmanagement.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClassRepository extends JpaRepository<ClassEntity, Long> {

    @Query("select classEntity from ClassEntity classEntity where classEntity.teacher.id = :teacherId order by classEntity.grade, classEntity.name")
    List<ClassEntity> findAllByTeacherId(Long teacherId);

    boolean existsByNameIgnoreCaseAndAcademicYearAndTeacherId(String name, String academicYear, Long teacherId);
}