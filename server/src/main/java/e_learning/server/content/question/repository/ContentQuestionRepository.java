package e_learning.server.content.question.repository;

import e_learning.server.content.question.entity.ContentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Collection;
import java.util.List;

public interface ContentQuestionRepository
        extends JpaRepository<ContentQuestion, Long>, JpaSpecificationExecutor<ContentQuestion> {

    long countByQuestionBankId(Long questionBankId);

    long countByQuestionBankIdAndQuestionCompleteTrue(Long questionBankId);

    @Query("""
        select cq.questionBank.id, count(cq), sum(case when q.complete = true then 1 else 0 end)
        from ContentQuestion cq
        join cq.question q
        where cq.questionBank.id in :bankIds
        group by cq.questionBank.id
        """)
    List<Object[]> countQuestionTotalsByBankIds(@Param("bankIds") Collection<Long> bankIds);

    List<ContentQuestion> findTop100ByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(Long questionBankId);

    List<ContentQuestion> findAllByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(Long questionBankId);
}
