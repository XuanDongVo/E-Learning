package e_learning.server.content.question.repository;

import e_learning.server.content.question.entity.QuestionMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionMediaRepository
        extends JpaRepository<QuestionMedia, Long> {

    List<QuestionMedia> findByQuestionIdOrderByDisplayOrderAsc(
            Long questionId
    );

    boolean existsByMediaId(Long mediaId);

    boolean existsByQuestionIdAndMediaId(
            Long questionId,
            Long mediaId
    );

    void deleteByQuestionIdAndMediaId(
            Long questionId,
            Long mediaId
    );
}