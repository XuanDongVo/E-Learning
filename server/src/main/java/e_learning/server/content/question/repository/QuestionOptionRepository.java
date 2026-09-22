package e_learning.server.content.question.repository;

import e_learning.server.content.question.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findByQuestionIdOrderByDisplayOrderAsc(Long questionId);
    void deleteByQuestionId(Long questionId);
}
