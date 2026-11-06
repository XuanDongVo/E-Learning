package e_learning.server.gamification.repository;

import e_learning.server.gamification.entity.StudentLearningDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface StudentLearningDayRepository extends JpaRepository<StudentLearningDay, Long> {
    Optional<StudentLearningDay> findByStudentIdAndLearningDate(Long studentId, LocalDate learningDate);
}
