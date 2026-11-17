package e_learning.server.activity.service;

import e_learning.server.content.question.entity.ContentQuestion;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.guided.GuidedDefinitionStatus;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ActivityQuestionEligibilityOrderingTest {
    private final ContentQuestionRepository repository = mock(ContentQuestionRepository.class);
    private final ActivityQuestionEligibilityService service =
            new ActivityQuestionEligibilityService(repository);

    @Test
    void orderingIsEligibleForClassicAndGuidedFinal() {
        ContentQuestion ordering = contentQuestion(QuestionType.ORDERING);
        ContentQuestion choice = contentQuestion(QuestionType.SINGLE_CHOICE);
        when(repository.findAllByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(9L))
                .thenReturn(List.of(ordering, choice));
        when(repository.findAllGuidedReadyByQuestionBankIdOrderByQuestionIdAsc(
                9L, GuidedDefinitionStatus.READY))
                .thenReturn(List.of(ordering, choice));

        assertEquals(List.of(ordering, choice), service.classicCandidates(9L));
        assertEquals(List.of(ordering, choice), service.guidedCandidates(9L));
    }

    private ContentQuestion contentQuestion(QuestionType type) {
        Question question = mock(Question.class);
        when(question.getType()).thenReturn(type);
        return ContentQuestion.builder().question(question).build();
    }
}
