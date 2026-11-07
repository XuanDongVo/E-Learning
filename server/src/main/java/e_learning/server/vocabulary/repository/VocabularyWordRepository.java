package e_learning.server.vocabulary.repository;

import e_learning.server.vocabulary.entity.VocabularyWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VocabularyWordRepository extends JpaRepository<VocabularyWord, Long> {

    List<VocabularyWord> findByUnitIdAndStatusOrderByDisplayOrderAsc(Long unitId, String status);

    long countByUnitIdAndStatus(Long unitId, String status);

    @Query("SELECT v FROM VocabularyWord v WHERE v.unit.grade.id = :gradeId AND v.unit.id != :unitId AND v.status = 'ACTIVE'")
    List<VocabularyWord> findDistractorsFromGrade(@Param("gradeId") Long gradeId, @Param("unitId") Long unitId);

    @Query("SELECT v FROM VocabularyWord v WHERE v.status = 'ACTIVE'")
    List<VocabularyWord> findAllActive();
}

