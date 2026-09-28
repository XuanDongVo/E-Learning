package e_learning.server.content.question.repository;

import e_learning.server.content.question.entity.QuestionMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;

public interface QuestionMediaRepository
        extends JpaRepository<QuestionMedia, Long> {

    List<QuestionMedia> findByQuestionIdOrderByDisplayOrderAsc(Long questionId);

    boolean existsByMediaId(Long mediaId);

    boolean existsByQuestionIdAndMediaId(Long questionId,Long mediaId);

    void deleteByQuestionIdAndMediaId(Long questionId,Long mediaId);

    void deleteByQuestionId(Long questionId);

    @Query("""
    SELECT qm.media.id
    FROM QuestionMedia qm
    WHERE qm.question.id IN :questionIds
""")
    Set<Long> findMediaIdsByQuestionIdIn (Set<Long> questionIds);
}