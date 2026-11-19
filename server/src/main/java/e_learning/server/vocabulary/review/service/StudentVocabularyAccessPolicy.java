package e_learning.server.vocabulary.review.service;

import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Vocabulary-owned Student visibility boundary.
 *
 * <p>The current adapter uses published Units in the Student's active Grade.
 * Library, preview and write services depend on this policy so a future accepted
 * vocabulary source can extend visibility without changing FSRS ownership.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentVocabularyAccessPolicy {

    private final StudentUnitService studentUnitService;

    public Specification<StudentVocabularyProgress> accessibleProgress(Long studentId) {
        var visibleUnitIds = studentUnitService.getVisibleUnitIds(studentId);

        return (root, query, criteriaBuilder) -> {
            if (visibleUnitIds.isEmpty()) {
                return criteriaBuilder.disjunction();
            }
            return criteriaBuilder.and(
                    criteriaBuilder.equal(root.get("student").get("id"), studentId),
                    criteriaBuilder.equal(root.get("word").get("status"), VocabularyStatus.ACTIVE),
                    root.get("word").get("unit").get("id").in(visibleUnitIds)
            );
        };
    }

    public void requireAccessible(Long studentId, VocabularyWord word) {
        studentUnitService.requireVisibleUnit(studentId, word.getUnit().getId());
    }
}
