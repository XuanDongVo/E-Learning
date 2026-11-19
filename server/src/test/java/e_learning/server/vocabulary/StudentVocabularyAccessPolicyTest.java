package e_learning.server.vocabulary;

import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.review.service.StudentVocabularyAccessPolicy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class StudentVocabularyAccessPolicyTest {

    @Mock private StudentUnitService studentUnitService;

    @Test
    void wordAuthorizationDelegatesToTheCurrentPublishedUnitRule() {
        var policy = new StudentVocabularyAccessPolicy(studentUnitService);
        var word = VocabularyWord.builder().unit(Unit.builder().id(12L).build()).build();

        policy.requireAccessible(7L, word);

        verify(studentUnitService).requireVisibleUnit(7L, 12L);
    }
}
