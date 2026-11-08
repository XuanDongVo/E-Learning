package e_learning.server.gamification.streak.repository;

import e_learning.server.gamification.streak.entity.StudentLearningDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface StudentLearningDayRepository extends JpaRepository<StudentLearningDay, Long> {
    Optional<StudentLearningDay> findByStudentIdAndLearningDate(Long studentId, LocalDate learningDate);
    List<StudentLearningDay> findAllByStudentIdAndLearningDateBetween(Long studentId, LocalDate from, LocalDate to);
}
