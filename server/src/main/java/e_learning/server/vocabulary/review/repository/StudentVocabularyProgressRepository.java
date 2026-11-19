package e_learning.server.vocabulary.review.repository;

import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface StudentVocabularyProgressRepository extends JpaRepository<StudentVocabularyProgress, Long>,
        JpaSpecificationExecutor<StudentVocabularyProgress> {

    @Override
    @EntityGraph(attributePaths = {"word", "word.unit"})
    Page<StudentVocabularyProgress> findAll(Specification<StudentVocabularyProgress> specification, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"word", "word.unit"})
    List<StudentVocabularyProgress> findAll(Specification<StudentVocabularyProgress> specification, Sort sort);

    List<StudentVocabularyProgress> findAllByStudentIdAndWordUnitId(Long studentId, Long unitId);

    List<StudentVocabularyProgress> findAllByStudentIdAndWordUnitIdIn(Long studentId, List<Long> unitIds);

    Optional<StudentVocabularyProgress> findByStudentIdAndWordId(Long studentId, Long wordId);

    boolean existsByWordId(Long wordId);
}
