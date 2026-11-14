package e_learning.server.vocabulary.review.repository;

import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentVocabularyProgressRepository extends JpaRepository<StudentVocabularyProgress, Long> {
    List<StudentVocabularyProgress> findAllByStudentIdAndWordUnitId(Long studentId, Long unitId);

    List<StudentVocabularyProgress> findAllByStudentIdAndWordUnitIdIn(Long studentId, List<Long> unitIds);

    Optional<StudentVocabularyProgress> findByStudentIdAndWordId(Long studentId, Long wordId);

    boolean existsByWordId(Long wordId);
}
