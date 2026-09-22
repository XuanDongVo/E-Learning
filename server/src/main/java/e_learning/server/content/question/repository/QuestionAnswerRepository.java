package e_learning.server.content.question.repository;

import e_learning.server.content.question.entity.QuestionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionAnswerRepository extends JpaRepository<QuestionAnswer, Long> {
    List<QuestionAnswer> findByQuestionId(Long questionId);
    void deleteByQuestionId(Long questionId);
}
