package e_learning.server.content.question.repository;

import e_learning.server.content.question.entity.ContentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface ContentQuestionRepository
        extends JpaRepository<ContentQuestion, Long>, JpaSpecificationExecutor<ContentQuestion> {

    long countByQuestionBankId(Long questionBankId);

    long countByQuestionBankIdAndQuestionCompleteTrue(Long questionBankId);

    List<ContentQuestion> findTop100ByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(Long questionBankId);
}
