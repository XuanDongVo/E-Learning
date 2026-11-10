package e_learning.server.vocabulary.repository;

import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VocabularyWordRepository extends JpaRepository<VocabularyWord, Long>, JpaSpecificationExecutor<VocabularyWord> {

    List<VocabularyWord> findByUnitIdOrderByDisplayOrderAsc(Long unitId);

    List<VocabularyWord> findByUnitIdAndStatusOrderByDisplayOrderAsc(Long unitId, VocabularyStatus status);

    long countByUnitIdAndStatus(Long unitId, VocabularyStatus status);

    long countByUnitId(Long unitId);

    boolean existsByUnitIdAndWordIgnoreCase(Long unitId, String word);

    boolean existsByUnitIdAndWordIgnoreCaseAndIdNot(Long unitId, String word, Long id);

    @Query("SELECT COALESCE(MAX(v.displayOrder), 0) FROM VocabularyWord v WHERE v.unit.id = :unitId")
    Integer findMaxDisplayOrderByUnitId(@Param("unitId") Long unitId);

    @Query("SELECT v FROM VocabularyWord v WHERE v.unit.grade.id = :gradeId AND v.unit.id != :unitId AND v.status = e_learning.server.vocabulary.enums.VocabularyStatus.ACTIVE")
    List<VocabularyWord> findDistractorsFromGrade(@Param("gradeId") Long gradeId, @Param("unitId") Long unitId);

    @Query("SELECT v FROM VocabularyWord v WHERE v.status = e_learning.server.vocabulary.enums.VocabularyStatus.ACTIVE")
    List<VocabularyWord> findAllActive();
}
