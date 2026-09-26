package e_learning.server.content.question.repository;

import e_learning.server.content.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    long countByQuestionBankId(Long questionBankId);
    long countByQuestionBankIdAndCompleteTrue(Long questionBankId);
}
